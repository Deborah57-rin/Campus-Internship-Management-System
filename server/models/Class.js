const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a class name'],
      trim: true,
      minlength: [3, 'Class name must be at least 3 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please add a class code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Please add semester information'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Please add academic year'],
      trim: true,
      match: [/^\d{4}$/, 'Academic year must be in the format YYYY'],
    },
    beginningTime: {
      type: String,
      required: [true, 'Please add class beginning time'],
      trim: true,
    },
    endingTime: {
      type: String,
      required: [true, 'Please add class ending time'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Please add class venue'],
      trim: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Class must have an assigned lecturer'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);

