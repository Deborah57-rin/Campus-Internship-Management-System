const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSystemProgressReport } = require('../controllers/adminController');

const router = express.Router();

router.use(protect);

// Phase 8: Internship progress aggregated statistics
router.get('/internship-progress', getSystemProgressReport);

module.exports = router;

