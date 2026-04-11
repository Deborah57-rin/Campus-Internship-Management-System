const Class = require('../models/Class');
const Logbook = require('../models/Logbook');
const FinalReport = require('../models/FinalReport');

const lecturerOnly = (user) => {
  if (!user || user.role !== 'lecturer') {
    const err = new Error('Only lecturers can access this action');
    err.statusCode = 403;
    throw err;
  }
};

exports.getMyClasses = async (req, res) => {
  try {
    lecturerOnly(req.user);
    const classes = await Class.find({ lecturer: req.user._id })
      .populate('lecturer', 'name email')
      .populate('students', 'name email');

    res.status(200).json({ success: true, data: classes });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load classes' });
  }
};

exports.getLogbooksToReview = async (req, res) => {
  try {
    lecturerOnly(req.user);

    const { status = 'Pending', classId } = req.query;
    const assignedClasses = await Class.find({ lecturer: req.user._id }).select('_id');
    const assignedClassIds = assignedClasses.map((c) => c._id);

    const query = {
      class: { $in: assignedClassIds },
      status,
    };

    if (classId) {
      query.class = classId;
    }

    const logbooks = await Logbook.find(query)
      .populate('student', 'name email')
      .populate('class', 'name code semester academicYear')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: logbooks });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load logbooks' });
  }
};

exports.reviewLogbook = async (req, res) => {
  try {
    lecturerOnly(req.user);

    const { status, lecturerComment } = req.body;
    const { id } = req.params;

    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const logbook = await Logbook.findById(id);
    if (!logbook) return res.status(404).json({ message: 'Logbook not found' });

    // Ensure this logbook belongs to a class assigned to the lecturer
    const classDoc = await Class.findById(logbook.class).select('lecturer');
    if (!classDoc || String(classDoc.lecturer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review this logbook' });
    }

    logbook.status = status;
    logbook.lecturerComment = lecturerComment ?? logbook.lecturerComment;
    logbook.reviewedAt = new Date();

    await logbook.save();
    res.status(200).json({ success: true, data: logbook });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to review logbook' });
  }
};

exports.getLecturerReports = async (req, res) => {
  try {
    lecturerOnly(req.user);

    const { classId } = req.query;

    const classesQuery = Class.find({ lecturer: req.user._id });
    if (classId) classesQuery.where('_id').equals(classId);

    const classes = await classesQuery.populate('students', 'name email');

    const classSummaries = await Promise.all(
      classes.map(async (cls) => {
        const students = cls.students || [];

        // Logbooks grouped by student for this class
        const studentIds = students.map((s) => s._id);
        const logbooks = await Logbook.find({ class: cls._id, student: { $in: studentIds } });

        const logbooksByStudent = new Map();
        for (const l of logbooks) {
          const sid = String(l.student);
          if (!logbooksByStudent.has(sid)) {
            logbooksByStudent.set(sid, []);
          }
          logbooksByStudent.get(sid).push(l);
        }

        // Final reports by student for this class
        const finalReports = await FinalReport.find({ class: cls._id, student: { $in: studentIds } });
        const finalByStudent = new Map(finalReports.map((r) => [String(r.student), r]));

        const studentsProgress = students.map((s) => {
          const logs = logbooksByStudent.get(String(s._id)) || [];
          const counts = logs.reduce(
            (acc, l) => {
              acc.total += 1;
              if (l.status === 'Approved') acc.approved += 1;
              if (l.status === 'Pending') acc.pending += 1;
              if (l.status === 'Rejected') acc.rejected += 1;
              return acc;
            },
            { total: 0, approved: 0, pending: 0, rejected: 0 }
          );

          const report = finalByStudent.get(String(s._id));

          return {
            student: {
              _id: s._id,
              name: s.name,
              email: s.email,
            },
            logbookStats: counts,
            finalReport: report
              ? {
                  _id: report._id,
                  status: report.status,
                  title: report.title,
                  reviewedAt: report.reviewedAt,
                }
              : null,
          };
        });

        return {
          class: {
            _id: cls._id,
            name: cls.name,
            code: cls.code,
            semester: cls.semester,
            academicYear: cls.academicYear,
          },
          studentsProgress,
        };
      })
    );

    res.status(200).json({ success: true, data: classSummaries });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load reports' });
  }
};

