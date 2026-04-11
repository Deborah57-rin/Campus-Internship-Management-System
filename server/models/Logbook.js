const mongoose = require('mongoose');

const logbookSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Logbook must belong to a student'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Logbook must be associated with a class'],
    },
    logDate: {
      type: Date,
      required: [true, 'Please specify the work date'],
    },
    timeIn: {
      type: String,
      required: [true, 'Please add time in'],
      trim: true,
    },
    timeOut: {
      type: String,
      required: [true, 'Please add time out'],
      trim: true,
    },
    hoursWorked: {
      type: Number,
      required: [true, 'Please add hours worked'],
      min: [0, 'Hours worked cannot be negative'],
      max: [24, 'Hours worked cannot exceed 24 in a day'],
    },
    activities: {
      type: String,
      required: [true, 'Please describe your daily tasks and activities'],
      minlength: [10, 'Activities description should be at least 10 characters'],
      trim: true,
    },
    learningOutcomes: {
      type: String,
      trim: true,
    },
    challenges: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    lecturerComment: {
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

module.exports = mongoose.model('Logbook', logbookSchema);

