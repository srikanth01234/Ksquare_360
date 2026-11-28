const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const Site = require('../src/models/Site');
const Expense = require('../src/models/Expense');
const Payment = require('../src/models/Payment');
const DailyUpdate = require('../src/models/DailyUpdate');

async function main() {
  const port = Number(process.env.KSQUARE_TEST_MONGO_PORT || 27191);
  const dbName = `ksquare_workflow_test_${Date.now()}`;
  const app = express();
  app.use(express.json());
  for (const [path, router] of [
    ['sites', '../src/routes/siteRoutes'],
    ['expenses', '../src/routes/expenseRoutes'],
    ['payments', '../src/routes/paymentRoutes'],
    ['daily-updates', '../src/routes/dailyUpdateRoutes'],
  ]) {
    app.use(`/${path}`, require(router));
  }
  app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
  });

  let server;
  try {
    await mongoose.connect(`mongodb://127.0.0.1:${port}/`, { dbName, serverSelectionTimeoutMS: 5000 });
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => server.once('listening', resolve).once('error', reject));
    const base = `http://127.0.0.1:${server.address().port}`;

    async function api(path, { method = 'GET', body, status = 200 } = {}) {
      const response = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const result = await response.json();
      assert.equal(response.status, status, `${method} ${path} ${JSON.stringify(result)}`);
      return result;
    }
    const post = (path, body, status = 201) => api(path, { method: 'POST', body, status });
    const put = (path, body, status) => api(path, { method: 'PUT', body, status });
    const remove = (path) => api(path, { method: 'DELETE' });
    const first = await Site.create({ name: 'Workflow Site', code: 'TEST-A', client: 'Client A', projectBudget: 1000 });
    const second = await Site.create({ name: 'Workflow Site', code: 'TEST-B', client: 'Client B', projectBudget: 2000 });
    const siteId = String(first._id);
    const otherSiteId = String(second._id);
    const bill = { siteId, category: 'Materials', description: 'Bricks', amount: 100.50, paymentStatus: 'Pending' };
    const { data: regular } = await post('/expenses', bill);
    const extra = {
      ...bill, category: 'Additional Work', description: 'Extra wall', amount: 35.25,
      submissionKey: 'extra-wall', logDailyActivity: true,
    };
    const { data: additional } = await post('/expenses', extra);
    assert.equal(additional.expenseType, 'ADDITIONAL_WORK');
    assert.equal((await post('/expenses', extra, 200)).data._id, additional._id);
    assert.equal(await Expense.countDocuments({ submissionKey: extra.submissionKey }), 1);
    assert.equal(await DailyUpdate.countDocuments({ expense: additional._id }), 1);
    assert.equal((await api(`/sites/${siteId}`)).data.financials.totalExpenses, 135.75);
    assert.equal((await api(`/expenses/summary?siteId=${siteId}`)).data.additionalWorkExpenses, 35.25);
    assert.equal((await api(`/sites/${otherSiteId}`)).data.financials.totalExpenses, 0);
    console.log('PASS ordinary and additional expenses, site isolation, summary totals, and duplicate submission');

    await post('/expenses', {
      ...extra,
      category: 'Labour',
      description: 'Expense whose activity fails validation',
      submissionKey: 'failed-activity',
      paymentStatus: 'Paid',
      quantity: -1,
    }, 500);
    assert.equal(await Expense.countDocuments({ submissionKey: 'failed-activity' }), 0);
    assert.equal(await Payment.countDocuments(), 0);
    assert.equal(await DailyUpdate.countDocuments(), 1);
    console.log('PASS expense and payment roll back when creating the activity fails');

    const payout = { siteId, expenseId: regular._id, amount: 40.25, partyName: 'Supplier', flowType: 'OUTGOING' };
    await post('/payments', { ...payout, siteId: otherSiteId }, 400);
    await post('/payments', { ...payout, expenseId: String(new mongoose.Types.ObjectId()) }, 404);
    await post('/payments', { ...payout, amount: 101 }, 400);
    assert.equal(await Payment.countDocuments(), 0);
    assert.equal(await Expense.countDocuments(), 2);
    const firstInstallment = (await post('/payments', payout)).data;
    let expense = (await api(`/expenses/${regular._id}`)).data;
    assert.deepEqual([expense.paymentStatus, expense.paidAmount, expense.pendingAmount], ['Partial', 40.25, 60.25]);
    const pending = (await post('/payments', { ...payout, amount: 50, status: 'Pending' })).data;
    const lastInstallment = (await post('/payments', { ...payout, amount: 60.25 })).data;
    await put(`/payments/${pending._id}`, { status: 'Cleared' }, 400);
    await put(`/expenses/${regular._id}`, { amount: 80, paymentStatus: 'Paid' }, 400);
    assert.equal((await api(`/expenses/${regular._id}`)).data.paymentStatus, 'Paid');
    assert.ok(!(await api('/payments/pending-expenses')).data.some((entry) => entry._id === regular._id));
    await remove(`/payments/${lastInstallment._id}`);
    await put(`/payments/${pending._id}`, { status: 'Cleared' });
    await put(`/payments/${firstInstallment._id}`, { amount: 45 });
    expense = (await api(`/expenses/${regular._id}`)).data;
    assert.deepEqual([expense.paymentStatus, expense.paidAmount, expense.pendingAmount], ['Partial', 95, 5.5]);
    console.log('PASS linked installments, invalid links, overpayments, status-only clearing, edits, and deletion');

    const parallelPayout = { ...payout, expenseId: additional._id, amount: 25 };
    const concurrent = await Promise.all([1, 2].map(() => fetch(base + '/payments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parallelPayout),
    })));
    assert.deepEqual(concurrent.map((response) => response.status).sort(), [201, 400]);
    assert.equal(await Payment.countDocuments({ expense: additional._id }), 1);

    const direct = (await post('/payments', {
      siteId, amount: 20, partyName: 'Vendor', flowType: 'OUTGOING', status: 'Pending', category: 'Additional Work',
    })).data;
    const directExpense = (await api(`/expenses/${direct.expense}`)).data;
    assert.deepEqual([directExpense.expenseType, directExpense.paymentStatus, directExpense.paidAmount], ['ADDITIONAL_WORK', 'Pending', 0]);
    const receipt = { siteId, partyName: 'Client A', flowType: 'RECEIVED' };
    await post('/payments', { ...receipt, amount: 200.50 });
    await post('/payments', { ...receipt, amount: 300, status: 'Pending' });
    const ledger = (await api(`/payments/summary?siteId=${siteId}`)).data;
    assert.deepEqual([ledger.totalReceived, ledger.totalOutgoing, ledger.pendingReceived, ledger.pendingOutgoing], [200.50, 120, 300, 20]);
    assert.equal((await api(`/sites/${siteId}`)).data.financials.clientPaid, 200.50);
    console.log('PASS concurrent settlement, direct pending additional work, and cleared cash totals');

    const update = { siteId, description: 'Daily record', workPhase: 'Masonry', workersCount: 3, materialsUsed: 'Bricks' };
    await post('/daily-updates', { ...update, title: 'Started', progress: 0, date: '2025-02-01' });
    await post('/daily-updates', { ...update, title: 'Progress', progress: 75, date: '2025-02-02' });
    await post('/daily-updates', { ...update, title: 'Invalid progress', progress: 101 }, 400);
    const updates = (await api(`/daily-updates?siteId=${siteId}`)).data;
    assert.deepEqual(updates.find((row) => row.title === 'Started').progress, 0);
    const latest = updates.find((row) => row.title === 'Progress');
    assert.deepEqual([latest.progress, latest.materialsUsed, latest.status], [75, 'Bricks', 'In Progress']);
    assert.equal((await api('/sites')).data.find((site) => site.code === first.code).progress, 75);
    assert.equal((await api('/daily-updates/sites-overview')).data.find((site) => site.code === first.code).progress, 75);
    console.log('PASS saved daily progress, materials, status, and site overview');

    const fixtureDate = new Date('2025-01-01');
    await Expense.insertMany(Array.from({ length: 105 }, (_, index) => ({
      ...bill, site: first._id, amount: 2, description: `Older expense ${index}`, date: fixtureDate,
    })));
    await Payment.insertMany(Array.from({ length: 105 }, (_, index) => ({
      ...receipt, site: first._id, amount: 3, partyName: `Older receipt ${index}`, date: fixtureDate,
    })));
    await DailyUpdate.insertMany(Array.from({ length: 105 }, (_, index) => ({
      ...update, site: first._id, title: `Older update ${index}`, date: fixtureDate,
    })));
    for (const path of ['expenses', 'payments', 'daily-updates']) {
      const firstPage = await api(`/${path}?siteId=${siteId}&page=1&limit=100`);
      const secondPage = await api(`/${path}?siteId=${siteId}&page=2&limit=100`);
      const ids = new Set([...firstPage.data, ...secondPage.data].map((row) => row._id));
      assert.ok(firstPage.totalCount > 100);
      assert.equal(ids.size, firstPage.totalCount);
    }
    const site = (await api(`/sites/${siteId}`)).data;
    assert.equal(site.financials.totalExpenses, 365.75);
    assert.equal(site.financials.clientPaid, 515.50);
    assert.equal(site.progress, 75);
    console.log('PASS histories over 100 records and uncapped site totals');

    await remove(`/expenses/${additional._id}`);
    assert.equal(await DailyUpdate.countDocuments({ expense: additional._id }), 0);
    assert.equal(await Payment.countDocuments({ expense: additional._id }), 0);
    console.log('PASS linked records removed with the deleted expense');
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
