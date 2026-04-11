const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getStudentDashboard,
  createLogbook,
  getMyLogbooks,
  uploadFinalReport,
  getMyFinalReport,
} = require('../controllers/studentController');

const router = express.Router();

// All student routes require authentication (student role enforced in controller)
router.use(protect);

router.get('/dashboard', getStudentDashboard);
router.post('/logbooks', createLogbook);
router.get('/logbooks', getMyLogbooks);
router.post('/report', uploadFinalReport);
router.get('/report', getMyFinalReport);

module.exports = router;

