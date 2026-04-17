const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getStudentDashboard,
  createLogbook,
  getMyLogbooks,
  submitWeeklyReport,
  getMyWeeklyReports,
  getInternshipContract,
  upsertInternshipContract,
  uploadIndemnityDocument,
  uploadFinalReport,
  getMyFinalReport,
} = require('../controllers/studentController');
const { uploadIndemnity, uploadReportFiles, runUpload } = require('../middleware/studentUploads');

const router = express.Router();

// All student routes require authentication (student role enforced in controller)
router.use(protect);

router.get('/dashboard', getStudentDashboard);
router.post('/logbooks', createLogbook);
router.get('/logbooks', getMyLogbooks);
router.post('/weekly-reports', submitWeeklyReport);
router.get('/weekly-reports', getMyWeeklyReports);
router.get('/internship-contract', getInternshipContract);
router.put('/internship-contract', upsertInternshipContract);
router.get('/internship-contact', getInternshipContract);
router.put('/internship-contact', upsertInternshipContract);
router.post('/documents/indemnity', runUpload(uploadIndemnity), uploadIndemnityDocument);
router.post('/report', runUpload(uploadReportFiles), uploadFinalReport);
router.get('/report', getMyFinalReport);

module.exports = router;

