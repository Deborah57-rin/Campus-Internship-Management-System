const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { serveStudentDocument } = require('../controllers/fileController');

const router = express.Router();

router.use(protect);
router.get('/student/:studentId/:docType', serveStudentDocument);

module.exports = router;
