const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getLabourers,
  getLabourById,
  createLabour,
  updateLabour,
  deleteLabour,
  recordAttendance,
  getWageSummary,
} = require('../controllers/labourController');

router.get('/wages-summary', getWageSummary);
router.post('/attendance', recordAttendance);

router.route('/')
  .get(getLabourers)
  .post(upload.single('photo'), createLabour);

router.route('/:id')
  .get(getLabourById)
  .put(upload.single('photo'), updateLabour)
  .delete(deleteLabour);

module.exports = router;

