const express = require('express');
const router = express.Router();
const {
  getAllDropdowns,
  updateDropdown,
  createDropdown,
  deleteDropdown,
  resetDropdown,
} = require('../controllers/dropdownController');

router.get('/', getAllDropdowns);
router.post('/', createDropdown);
router.put('/:key', updateDropdown);
router.delete('/:key', deleteDropdown);
router.post('/:key/reset', resetDropdown);

module.exports = router;
