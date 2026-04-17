const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '../uploads');

function ensureStudentDir(studentId) {
  const dir = path.join(UPLOAD_ROOT, 'student-documents', String(studentId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureStudentDir(req.user._id));
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const prefix =
      file.fieldname === 'indemnity'
        ? 'indemnity'
        : file.fieldname === 'evaluationForm'
          ? 'evaluation'
          : file.fieldname === 'finalReport'
            ? 'final'
            : 'doc';
    cb(null, `${prefix}-${Date.now()}-${safe}`);
  },
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed'));
  } else {
    cb(null, true);
  }
};

exports.UPLOAD_ROOT = UPLOAD_ROOT;

exports.toStoredRelativePath = (studentId, filename) =>
  path.posix.join('student-documents', String(studentId), filename);

exports.uploadIndemnity = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: pdfFilter,
}).single('indemnity');

exports.uploadReportFiles = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: pdfFilter,
}).fields([
  { name: 'finalReport', maxCount: 1 },
  { name: 'evaluationForm', maxCount: 1 },
]);

exports.runUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
};
