const path = require('path');
const fs = require('fs');
const FinalReport = require('../models/FinalReport');
const StudentDocuments = require('../models/StudentDocuments');
const Class = require('../models/Class');

const UPLOAD_ROOT = path.join(__dirname, '../uploads');

function resolveStoredAbsolute(relativePosixPath) {
  if (!relativePosixPath || typeof relativePosixPath !== 'string') return null;
  const segments = relativePosixPath.split('/').filter((s) => s && s !== '.' && s !== '..');
  const abs = path.normalize(path.join(UPLOAD_ROOT, ...segments));
  const relToRoot = path.relative(UPLOAD_ROOT, abs);
  if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) return null;
  return abs;
}

async function assertCanAccessStudentFile(viewer, studentId) {
  if (!viewer) {
    const err = new Error('Not authorized');
    err.statusCode = 401;
    throw err;
  }
  if (String(viewer._id) === String(studentId)) {
    return;
  }
  if (viewer.role === 'admin') {
    return;
  }
  if (viewer.role === 'lecturer') {
    const cls = await Class.findOne({ lecturer: viewer._id, students: studentId });
    if (cls) return;
  }
  const err = new Error('Not authorized to access this file');
  err.statusCode = 403;
  throw err;
}

// GET /api/files/student/:studentId/:docType  docType = final-report | evaluation | indemnity
exports.serveStudentDocument = async (req, res) => {
  try {
    const { studentId, docType } = req.params;
    await assertCanAccessStudentFile(req.user, studentId);

    let relativePath;
    let downloadName = 'document.pdf';

    if (docType === 'final-report') {
      const report = await FinalReport.findOne({ student: studentId });
      if (!report?.fileUrl) {
        return res.status(404).json({ message: 'Final report file not found' });
      }
      relativePath = report.fileUrl;
      downloadName = report.fileOriginalName || 'final-report.pdf';
    } else if (docType === 'evaluation') {
      const d = await StudentDocuments.findOne({ student: studentId });
      if (!d?.evaluationFormUrl) {
        return res.status(404).json({ message: 'Evaluation form not found' });
      }
      relativePath = d.evaluationFormUrl;
      downloadName = d.evaluationOriginalName || 'evaluation.pdf';
    } else if (docType === 'indemnity') {
      const d = await StudentDocuments.findOne({ student: studentId });
      if (!d?.indemnityFormUrl) {
        return res.status(404).json({ message: 'Indemnity form not found' });
      }
      relativePath = d.indemnityFormUrl;
      downloadName = d.indemnityOriginalName || 'indemnity.pdf';
    } else {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const abs = resolveStoredAbsolute(relativePath);
    if (!abs || !fs.existsSync(abs)) {
      return res.status(404).json({ message: 'File is not available on the server (legacy or missing upload)' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(downloadName)}"`);
    return res.sendFile(abs);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load file' });
  }
};
