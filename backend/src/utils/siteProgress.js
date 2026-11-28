const DailyUpdate = require('../models/DailyUpdate');

async function getSiteProgress(site) {
  const latest = await DailyUpdate.findOne({
    site: site._id,
    progress: { $gte: 0, $lte: 100 },
  }).sort({ date: -1, createdAt: -1, _id: -1 }).select('progress');
  return latest?.progress ?? (site.status === 'Completed' ? 100 : null);
}

module.exports = getSiteProgress;
