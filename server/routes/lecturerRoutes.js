const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMyClasses,
  getLogbooksToReview,
  reviewLogbook,
  getWeeklyReportsToReview,
  reviewWeeklyReport,
  getWeeklyReportDailyLogs,
  getLecturerReports,
} = require('../controllers/lecturerController');

const router = express.Router();

router.use(protect);

router.get('/classes', getMyClasses);
router.get('/logbooks', getLogbooksToReview);
router.patch('/logbooks/:id', reviewLogbook);
router.get('/weekly-reports', getWeeklyReportsToReview);
router.patch('/weekly-reports/:id', reviewWeeklyReport);
router.get('/weekly-reports/:id/daily-logs', getWeeklyReportDailyLogs);
router.get('/reports', getLecturerReports);

module.exports = router;

