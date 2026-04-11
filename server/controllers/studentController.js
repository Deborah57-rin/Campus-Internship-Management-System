const Logbook = require('../models/Logbook');
const FinalReport = require('../models/FinalReport');
const Class = require('../models/Class');

// Helper to ensure the current user is a student
const ensureStudent = (user) => {
  if (!user || user.role !== 'student') {
    const err = new Error('Only students can perform this action');
    err.statusCode = 403;
    throw err;
  }
};

// GET /api/student/dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    ensureStudent(req.user);

    const [logbooks, report, classes] = await Promise.all([
      Logbook.find({ student: req.user._id }).sort('-createdAt').limit(5),
      FinalReport.findOne({ student: req.user._id }),
      Class.find({ students: req.user._id })
        .populate('lecturer', 'name email')
        .sort('-createdAt'),
    ]);

    const totalSubmissions = await Logbook.countDocuments({ student: req.user._id });
    const approvedCount = await Logbook.countDocuments({ student: req.user._id, status: 'Approved' });

    const recentFeedback = logbooks
      .filter((l) => l.lecturerComment)
      .slice(0, 3)
      .map((l) => ({
        id: l._id,
        logDate: l.logDate,
        status: l.status,
        lecturerComment: l.lecturerComment,
        reviewedAt: l.reviewedAt,
      }));

    res.status(200).json({
      success: true,
      data: {
        submissions: {
          total: totalSubmissions,
          approved: approvedCount,
          pending: totalSubmissions - approvedCount,
        },
        recentLogbooks: logbooks,
        recentFeedback,
        finalReport: report,
        classes,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load dashboard' });
  }
};

// POST /api/student/logbooks
exports.createLogbook = async (req, res) => {
  try {
    ensureStudent(req.user);
    const { logDate, timeIn, timeOut, hoursWorked, activities, learningOutcomes, challenges } = req.body;

    if (!logDate || !timeIn || !timeOut || hoursWorked === undefined || !activities) {
      return res.status(400).json({ message: 'logDate, timeIn, timeOut, hoursWorked and activities are required' });
    }

    // Student class is managed by admin enrollment, so pick assigned class automatically.
    const classDoc = await Class.findOne({ students: req.user._id }).sort('-createdAt');
    if (!classDoc) {
      return res.status(404).json({ message: 'No assigned class found. Contact admin to enroll you first.' });
    }

    const normalizedLogDate = new Date(logDate);
    if (Number.isNaN(normalizedLogDate.getTime())) {
      return res.status(400).json({ message: 'Invalid logDate' });
    }
    normalizedLogDate.setHours(0, 0, 0, 0);

    const existing = await Logbook.findOne({
      student: req.user._id,
      class: classDoc._id,
      logDate: normalizedLogDate,
    });
    if (existing) {
      return res.status(400).json({ message: 'You already submitted a logbook for this date' });
    }

    const logbook = await Logbook.create({
      student: req.user._id,
      class: classDoc._id,
      logDate: normalizedLogDate,
      timeIn,
      timeOut,
      hoursWorked,
      activities,
      learningOutcomes,
      challenges,
    });

    res.status(201).json({ success: true, data: logbook });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to submit logbook' });
  }
};

// GET /api/student/logbooks
exports.getMyLogbooks = async (req, res) => {
  try {
    ensureStudent(req.user);

    const logbooks = await Logbook.find({ student: req.user._id })
      .populate('class', 'name code')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: logbooks });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load logbooks' });
  }
};

// POST /api/student/report
exports.uploadFinalReport = async (req, res) => {
  try {
    ensureStudent(req.user);
    const { classId, title, fileUrl } = req.body;

    if (!classId || !title || !fileUrl) {
      return res.status(400).json({ message: 'Class, title and file are required' });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const data = {
      student: req.user._id,
      class: classId,
      title,
      fileUrl,
      status: 'Pending',
      reviewedAt: null,
    };

    const report = await FinalReport.findOneAndUpdate(
      { student: req.user._id },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to upload final report' });
  }
};

// GET /api/student/report
exports.getMyFinalReport = async (req, res) => {
  try {
    ensureStudent(req.user);
    const report = await FinalReport.findOne({ student: req.user._id }).populate('class', 'name code');

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load final report' });
  }
};

