const mongoose = require('mongoose');

const finalReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Final report must belong to a student'],
      unique: true, // One final report per student
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Final report must be associated with a class'],
    },
    title: {
      type: String,
      required: [true, 'Please add a report title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide the report file URL or path'],
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FinalReport', finalReportSchema);

