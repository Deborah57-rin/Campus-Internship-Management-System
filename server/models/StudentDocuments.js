const mongoose = require('mongoose');

const studentDocumentsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    indemnityFormUrl: {
      type: String,
      trim: true,
      default: '',
    },
    indemnityOriginalName: {
      type: String,
      trim: true,
      default: '',
    },
    indemnityUploadedAt: {
      type: Date,
    },
    evaluationFormUrl: {
      type: String,
      trim: true,
      default: '',
    },
    evaluationOriginalName: {
      type: String,
      trim: true,
      default: '',
    },
    evaluationUploadedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentDocuments', studentDocumentsSchema);
