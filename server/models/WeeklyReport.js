const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Weekly report must belong to a student'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Weekly report must be associated with a class'],
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Please provide a week start date'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Please provide a week end date'],
    },
    summary: {
      type: String,
      required: [true, 'Please provide a weekly summary'],
      trim: true,
      minlength: [20, 'Weekly summary should be at least 20 characters'],
    },
    dailyLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Logbook',
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    lecturerFeedback: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

weeklyReportSchema.index(
  { student: 1, class: 1, weekStartDate: 1, weekEndDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
