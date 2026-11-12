const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getSitesOverview,
  getDailyUpdates,
  createDailyUpdate,
  deleteDailyUpdate,
} = require('../controllers/dailyUpdateController');

router.get('/sites-overview', getSitesOverview);

router.route('/')
  .get(getDailyUpdates)
  .post(upload.array('photos', 5), createDailyUpdate);

router.route('/:id')
  .delete(deleteDailyUpdate);

module.exports = router;

