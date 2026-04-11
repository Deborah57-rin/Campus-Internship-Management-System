const User = require('../models/User');
const Class = require('../models/Class');
const Logbook = require('../models/Logbook');
const FinalReport = require('../models/FinalReport');
const { roleFromEmail } = require('../config/roleEmailRules');

const adminOnly = (user) => {
  if (!user || user.role !== 'admin') {
    const err = new Error('Only admins can access this action');
    err.statusCode = 403;
    throw err;
  }
};

function buildSearchRegex(q) {
  const trimmed = String(q || '').trim();
  if (!trimmed) return null;
  return new RegExp(trimmed, 'i');
}

exports.createClass = async (req, res) => {
  try {
    adminOnly(req.user);
    const { name, code, semester, academicYear, beginningTime, endingTime, venue, lecturerId } = req.body;

    if (!name || !code || !semester || !academicYear || !beginningTime || !endingTime || !venue || !lecturerId) {
      return res.status(400).json({
        message: 'name, code, semester, academicYear, beginningTime, endingTime, venue, lecturerId are required',
      });
    }

    const lecturer = await User.findById(lecturerId);
    if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });

    const mappedRole = roleFromEmail(lecturer.email);
    if (mappedRole !== 'lecturer') {
      return res.status(400).json({ message: 'Selected lecturer email is not mapped as lecturer' });
    }

    const cls = await Class.create({
      name,
      code,
      semester,
      academicYear,
      beginningTime,
      endingTime,
      venue,
      lecturer: lecturerId,
      status: 'Active',
    });

    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to create class' });
  }
};

exports.assignLecturer = async (req, res) => {
  try {
    adminOnly(req.user);
    const { classId } = req.params;
    const { lecturerId } = req.body;

    if (!lecturerId) return res.status(400).json({ message: 'lecturerId is required' });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const lecturer = await User.findById(lecturerId);
    if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });

    const mappedRole = roleFromEmail(lecturer.email);
    if (mappedRole !== 'lecturer') {
      return res.status(400).json({ message: 'Selected email is not mapped as lecturer' });
    }

    cls.lecturer = lecturerId;
    await cls.save();

    res.status(200).json({ success: true, data: cls });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to assign lecturer' });
  }
};

exports.enrollStudents = async (req, res) => {
  try {
    adminOnly(req.user);
    const { classId } = req.params;
    const { studentEmails } = req.body;

    if (!Array.isArray(studentEmails) || studentEmails.length === 0) {
      return res.status(400).json({ message: 'studentEmails (array) is required' });
    }

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const users = await User.find({ email: { $in: studentEmails.map((e) => String(e).toLowerCase().trim()) } });

    const validStudentUsers = [];
    for (const u of users) {
      if (roleFromEmail(u.email) === 'student') {
        validStudentUsers.push(u);
      }
    }

    if (validStudentUsers.length === 0) {
      return res.status(400).json({ message: 'No valid student emails found' });
    }

    const studentIds = validStudentUsers.map((u) => u._id);

    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );

    const updated = await Class.findById(classId).populate('students', 'name email');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to enroll students' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    adminOnly(req.user);
    const { classId } = req.params;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    await Logbook.deleteMany({ class: classId });
    await FinalReport.deleteMany({ class: classId });
    await cls.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to delete class' });
  }
};

exports.listClasses = async (req, res) => {
  try {
    adminOnly(req.user);

    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const regex = buildSearchRegex(search);

    const query = regex
      ? { $or: [{ name: regex }, { code: regex }, { semester: regex }, { academicYear: regex }, { venue: regex }] }
      : {};

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('lecturer', 'name email')
      .populate('students', 'name email')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        items: classes,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to list classes' });
  }
};

exports.listLecturers = async (req, res) => {
  try {
    adminOnly(req.user);
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const regex = buildSearchRegex(search);

    const allUsers = await User.find({});
    const lecturers = allUsers.filter((u) => roleFromEmail(u.email) === 'lecturer');

    const filtered = regex
      ? lecturers.filter((u) => regex.test(u.name) || regex.test(u.email))
      : lecturers;

    const start = (pageNum - 1) * limitNum;
    const items = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        items,
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to list lecturers' });
  }
};

exports.listStudents = async (req, res) => {
  try {
    adminOnly(req.user);
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const regex = buildSearchRegex(search);

    const allUsers = await User.find({});
    const students = allUsers.filter((u) => roleFromEmail(u.email) === 'student');

    const filtered = regex
      ? students.filter((u) => regex.test(u.name) || regex.test(u.email))
      : students;

    const start = (pageNum - 1) * limitNum;
    const items = filtered.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        items,
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to list students' });
  }
};

exports.getClassById = async (req, res) => {
  try {
    adminOnly(req.user);
    const { classId } = req.params;
    const cls = await Class.findById(classId)
      .populate('lecturer', 'name email')
      .populate('students', 'name email');

    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ success: true, data: cls });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to get class' });
  }
};

exports.getSystemProgressReport = async (req, res) => {
  try {
    adminOnly(req.user);
    const { classId, status } = req.query;

    const classes = classId ? await Class.find({ _id: classId }) : await Class.find({});
    const classIds = classes.map((c) => c._id);
    const studentsByClass = await Promise.all(
      classes.map(async (c) => {
        const cls = await Class.findById(c._id).populate('students', 'name email');
        return cls;
      })
    );

    const logbookBaseQuery = { class: { $in: classIds } };
    const logbooksAll = await Logbook.find(logbookBaseQuery).populate('student', 'name email');

    const logbooksFiltered = status
      ? await Logbook.find({ ...logbookBaseQuery, status }).populate('student', 'name email')
      : logbooksAll;

    const logbookStatsAll = ['Pending', 'Approved', 'Rejected'].reduce((acc, s) => {
      acc[s] = logbooksAll.filter((l) => l.status === s).length;
      return acc;
    }, { Pending: 0, Approved: 0, Rejected: 0 });

    const logbookStatsFiltered = ['Pending', 'Approved', 'Rejected'].reduce((acc, s) => {
      acc[s] = logbooksFiltered.filter((l) => l.status === s).length;
      return acc;
    }, { Pending: 0, Approved: 0, Rejected: 0 });

    const finalQuery = { class: { $in: classIds } };
    const finalReports = await FinalReport.find(finalQuery).populate('student', 'name email');
    const finalStats = ['Pending', 'Approved', 'Rejected'].reduce((acc, s) => {
      acc[s] = finalReports.filter((r) => r.status === s).length;
      return acc;
    }, { Pending: 0, Approved: 0, Rejected: 0 });

    const classSummaries = studentsByClass.map((c) => {
      const stuIds = c.students.map((s) => s._id);
      const classLogbooksAll = logbooksAll.filter((l) => String(l.class) === String(c._id));
      const classLogbooksFiltered = logbooksFiltered.filter((l) => String(l.class) === String(c._id));
      const classFinal = finalReports.filter((r) => String(r.class) === String(c._id));

      const completedStudents = c.students.filter((s) =>
        classFinal.some((r) => String(r.student._id) === String(s._id))
      );

      return {
        class: {
          _id: c._id,
          name: c.name,
          code: c.code,
          semester: c.semester,
          academicYear: c.academicYear,
          beginningTime: c.beginningTime,
          endingTime: c.endingTime,
          venue: c.venue,
        },
        logbookStats: {
          total: classLogbooksAll.length,
          Pending: classLogbooksAll.filter((l) => l.status === 'Pending').length,
          Approved: classLogbooksAll.filter((l) => l.status === 'Approved').length,
          Rejected: classLogbooksAll.filter((l) => l.status === 'Rejected').length,
        },
        logbookStatsFiltered: {
          total: classLogbooksFiltered.length,
          Pending: classLogbooksFiltered.filter((l) => l.status === 'Pending').length,
          Approved: classLogbooksFiltered.filter((l) => l.status === 'Approved').length,
          Rejected: classLogbooksFiltered.filter((l) => l.status === 'Rejected').length,
        },
        finalReportStats: {
          total: classFinal.length,
          Pending: classFinal.filter((r) => r.status === 'Pending').length,
          Approved: classFinal.filter((r) => r.status === 'Approved').length,
          Rejected: classFinal.filter((r) => r.status === 'Rejected').length,
        },
        completion: {
          completedStudents: completedStudents.length,
          totalStudents: c.students.length,
          completionRate: c.students.length ? Math.round((completedStudents.length / c.students.length) * 100) : 0,
        },
      };
    });

    const allStudents = [...new Set(studentsByClass.flatMap((c) => c.students.map((s) => String(s._id))))];
    const studentsWithFinal = [...new Set(finalReports.map((r) => String(r.student._id)))];

    res.status(200).json({
      success: true,
      data: {
        summary: {
          logbookStats: {
            total: logbooksAll.length,
            Pending: logbookStatsAll.Pending,
            Approved: logbookStatsAll.Approved,
            Rejected: logbookStatsAll.Rejected,
          },
          logbookStatsFiltered: {
            total: logbooksFiltered.length,
            Pending: logbookStatsFiltered.Pending,
            Approved: logbookStatsFiltered.Approved,
            Rejected: logbookStatsFiltered.Rejected,
          },
          finalReportStats: {
            total: finalReports.length,
            Pending: finalStats.Pending,
            Approved: finalStats.Approved,
            Rejected: finalStats.Rejected,
          },
          completion: {
            completedStudents: studentsWithFinal.length,
            totalStudents: allStudents.length,
            completionRate: allStudents.length ? Math.round((studentsWithFinal.length / allStudents.length) * 100) : 0,
          },
        },
        classSummaries,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load system reports' });
  }
};

