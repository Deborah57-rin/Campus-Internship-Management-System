const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMyClasses,
  getLogbooksToReview,
  reviewLogbook,
  getLecturerReports,
} = require('../controllers/lecturerController');

const router = express.Router();

router.use(protect);

router.get('/classes', getMyClasses);
router.get('/logbooks', getLogbooksToReview);
router.patch('/logbooks/:id', reviewLogbook);
router.get('/reports', getLecturerReports);

module.exports = router;

