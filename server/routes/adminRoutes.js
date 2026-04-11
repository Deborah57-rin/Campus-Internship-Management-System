const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createClass,
  assignLecturer,
  enrollStudents,
  deleteClass,
  listClasses,
  listLecturers,
  listStudents,
  getClassById,
  getSystemProgressReport,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect);

router.post('/classes', createClass);
router.patch('/classes/:classId/lecturer', assignLecturer);
router.patch('/classes/:classId/enroll', enrollStudents);
router.delete('/classes/:classId', deleteClass);

router.get('/classes', listClasses);
router.get('/lecturers', listLecturers);
router.get('/students', listStudents);

router.get('/reports/progress', getSystemProgressReport);

router.get('/classes/:classId', getClassById);

module.exports = router;

