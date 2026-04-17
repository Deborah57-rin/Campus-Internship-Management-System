const Logbook = require('../models/Logbook');
const FinalReport = require('../models/FinalReport');
const Class = require('../models/Class');
const WeeklyReport = require('../models/WeeklyReport');
const InternshipContract = require('../models/InternshipContract');
const StudentDocuments = require('../models/StudentDocuments');
const { toStoredRelativePath } = require('../middleware/studentUploads');

// Helper to ensure the current user is a student
const ensureStudent = (user) => {
  if (!user || user.role !== 'student') {
    const err = new Error('Only students can perform this action');
    err.statusCode = 403;
    throw err;
  }
};

const normalizeDateOnly = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const getAssignedClassForStudent = async (studentId) =>
  Class.findOne({ students: studentId }).sort('-createdAt');

const INTERNSHIP_CONTRACT_FIELDS = [
  'firmName',
  'location',
  'contactPerson',
  'firmPhoneNumber',
  'workingDaysPerWeek',
  'workingHoursPerDay',
  'beginningDate',
  'endDate',
  'academicSemester',
  'internDuties',
  'supervisorName',
  'supervisorEmail',
  'supervisorMobileNumber',
  'studentId',
  'studentMajor',
  'studentMinor',
  'studentEmailAddress',
  'studentMobileNumber',
];

// GET /api/student/dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    ensureStudent(req.user);

    const studentId = req.user._id;

    const [
      classes,
      report,
      internshipContract,
      studentDocuments,
      totalSubmissions,
      approvedCount,
      pendingCount,
      rejectedCount,
      feedbackRows,
    ] = await Promise.all([
      Class.find({ students: studentId })
        .populate('lecturer', 'name email')
        .sort('-createdAt'),
      FinalReport.findOne({ student: studentId }).populate('class', 'name code'),
      InternshipContract.findOne({ student: studentId }).select(
        '-student -class -createdAt -updatedAt -__v'
      ),
      StudentDocuments.findOne({ student: studentId }).select(
        'indemnityFormUrl indemnityOriginalName indemnityUploadedAt evaluationFormUrl evaluationOriginalName evaluationUploadedAt updatedAt'
      ),
      Logbook.countDocuments({ student: studentId }),
      Logbook.countDocuments({ student: studentId, status: 'Approved' }),
      Logbook.countDocuments({ student: studentId, status: 'Pending' }),
      Logbook.countDocuments({ student: studentId, status: 'Rejected' }),
      Logbook.find({
        student: studentId,
        lecturerComment: { $exists: true, $nin: [null, ''] },
      })
        .sort('-reviewedAt')
        .limit(5)
        .select('logDate status lecturerComment reviewedAt'),
    ]);

    const logbookCompletionRate =
      totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : null;

    const recentFeedback = feedbackRows.map((l) => ({
      id: l._id,
      logDate: l.logDate,
      status: l.status,
      lecturerComment: l.lecturerComment,
      reviewedAt: l.reviewedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        classes,
        logbookStats: {
          total: totalSubmissions,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
        logbookCompletionRate,
        finalReport: report,
        internshipContract,
        studentDocuments,
        recentFeedback,
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

// POST /api/student/weekly-reports
exports.submitWeeklyReport = async (req, res) => {
  try {
    ensureStudent(req.user);
    const { classId, weekStartDate, weekEndDate, summary } = req.body;

    if (!classId || !weekStartDate || !weekEndDate || !summary) {
      return res.status(400).json({
        message: 'classId, weekStartDate, weekEndDate and summary are required',
      });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    const enrolled = (classDoc.students || []).some(
      (sid) => String(sid) === String(req.user._id)
    );
    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    const start = normalizeDateOnly(weekStartDate);
    const end = normalizeDateOnly(weekEndDate);
    if (!start || !end || start > end) {
      return res.status(400).json({ message: 'Invalid week/date range' });
    }

    const dailyLogs = await Logbook.find({
      student: req.user._id,
      class: classId,
      logDate: { $gte: start, $lte: end },
    })
      .sort('logDate')
      .select('_id');

    if (!dailyLogs.length) {
      return res.status(400).json({
        message: 'No daily logbooks found for this date range. Submit daily logs first.',
      });
    }

    const existing = await WeeklyReport.findOne({
      student: req.user._id,
      class: classId,
      weekStartDate: start,
      weekEndDate: end,
    });

    if (existing && existing.status !== 'Pending') {
      return res.status(400).json({
        message: 'This weekly report is already reviewed and cannot be edited',
      });
    }

    const payload = {
      student: req.user._id,
      class: classId,
      weekStartDate: start,
      weekEndDate: end,
      summary,
      dailyLogs: dailyLogs.map((l) => l._id),
      status: existing ? existing.status : 'Pending',
    };

    const report = await WeeklyReport.findOneAndUpdate(
      {
        student: req.user._id,
        class: classId,
        weekStartDate: start,
        weekEndDate: end,
      },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('class', 'name code')
      .populate('dailyLogs', 'logDate timeIn timeOut hoursWorked activities status');

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to submit weekly report' });
  }
};

// GET /api/student/weekly-reports
exports.getMyWeeklyReports = async (req, res) => {
  try {
    ensureStudent(req.user);
    const reports = await WeeklyReport.find({ student: req.user._id })
      .populate('class', 'name code')
      .populate('dailyLogs', 'logDate hoursWorked')
      .sort('-weekStartDate');

    const mapped = reports.map((r) => ({
      ...r.toObject(),
      dailyLogCount: r.dailyLogs?.length || 0,
      totalHours: (r.dailyLogs || []).reduce((acc, l) => acc + (Number(l.hoursWorked) || 0), 0),
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load weekly reports' });
  }
};

// GET /api/student/internship-contract
exports.getInternshipContract = async (req, res) => {
  try {
    ensureStudent(req.user);
    const doc = await InternshipContract.findOne({ student: req.user._id }).populate('class', 'name code');
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load internship contract' });
  }
};

// PUT /api/student/internship-contract
exports.upsertInternshipContract = async (req, res) => {
  try {
    ensureStudent(req.user);
    const classDoc = await getAssignedClassForStudent(req.user._id);
    if (!classDoc) {
      return res.status(404).json({ message: 'No assigned class found. Contact admin to enroll you first.' });
    }
    const enrolled = (classDoc.students || []).some((sid) => String(sid) === String(req.user._id));
    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    const payload = {
      student: req.user._id,
      class: classDoc._id,
    };
    for (const key of INTERNSHIP_CONTRACT_FIELDS) {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        payload[key] = req.body[key];
      }
    }
    if (req.body.title !== undefined) {
      payload.supervisorTitle = req.body.title;
    } else if (req.body.supervisorTitle !== undefined) {
      payload.supervisorTitle = req.body.supervisorTitle;
    }

    const doc = await InternshipContract.findOneAndUpdate(
      { student: req.user._id },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('class', 'name code');

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to save internship contract' });
  }
};

// POST /api/student/documents/indemnity (multipart field: indemnity)
exports.uploadIndemnityDocument = async (req, res) => {
  try {
    ensureStudent(req.user);
    if (!req.file) {
      return res.status(400).json({ message: 'indemnity PDF file is required (field name: indemnity)' });
    }

    const classDoc = await getAssignedClassForStudent(req.user._id);
    if (!classDoc) {
      return res.status(404).json({ message: 'No assigned class found. Contact admin to enroll you first.' });
    }
    const enrolled = (classDoc.students || []).some((sid) => String(sid) === String(req.user._id));
    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    const rel = toStoredRelativePath(req.user._id, req.file.filename);

    const documents = await StudentDocuments.findOneAndUpdate(
      { student: req.user._id },
      {
        student: req.user._id,
        class: classDoc._id,
        indemnityFormUrl: rel,
        indemnityOriginalName: req.file.originalname || '',
        indemnityUploadedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: documents });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to upload indemnity form' });
  }
};

// POST /api/student/report (multipart: finalReport, evaluationForm; title in body)
exports.uploadFinalReport = async (req, res) => {
  try {
    ensureStudent(req.user);
    const title = req.body.title;
    const finalFile = req.files?.finalReport?.[0];
    const evalFile = req.files?.evaluationForm?.[0];

    if (!title || !finalFile || !evalFile) {
      return res.status(400).json({
        message: 'Title, final report PDF (field finalReport), and evaluation PDF (field evaluationForm) are required',
      });
    }

    let classDoc;
    if (req.body.classId) {
      classDoc = await Class.findById(req.body.classId);
    } else {
      classDoc = await getAssignedClassForStudent(req.user._id);
    }
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const enrolled = (classDoc.students || []).some((sid) => String(sid) === String(req.user._id));
    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    const finalRel = toStoredRelativePath(req.user._id, finalFile.filename);
    const evalRel = toStoredRelativePath(req.user._id, evalFile.filename);

    const data = {
      student: req.user._id,
      class: classDoc._id,
      title,
      fileUrl: finalRel,
      fileOriginalName: finalFile.originalname || '',
      status: 'Pending',
      reviewedAt: null,
    };

    const report = await FinalReport.findOneAndUpdate(
      { student: req.user._id },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const documents = await StudentDocuments.findOneAndUpdate(
      { student: req.user._id },
      {
        student: req.user._id,
        class: classDoc._id,
        evaluationFormUrl: evalRel,
        evaluationOriginalName: evalFile.originalname || '',
        evaluationUploadedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: { finalReport: report, documents } });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to upload final report' });
  }
};

// GET /api/student/report
exports.getMyFinalReport = async (req, res) => {
  try {
    ensureStudent(req.user);
    const [finalReport, documents] = await Promise.all([
      FinalReport.findOne({ student: req.user._id }).populate('class', 'name code'),
      StudentDocuments.findOne({ student: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        finalReport,
        documents,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load final report' });
  }
};

