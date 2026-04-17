const mongoose = require('mongoose');

const internshipContractSchema = new mongoose.Schema(
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
    firmName: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    contactPerson: { type: String, trim: true, default: '' },
    firmPhoneNumber: { type: String, trim: true, default: '' },
    workingDaysPerWeek: { type: String, trim: true, default: '' },
    workingHoursPerDay: { type: String, trim: true, default: '' },
    beginningDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    academicSemester: { type: String, trim: true, default: '' },
    internDuties: { type: String, trim: true, default: '' },
    supervisorName: { type: String, trim: true, default: '' },
    supervisorEmail: { type: String, trim: true, default: '' },
    supervisorTitle: { type: String, trim: true, default: '' },
    supervisorMobileNumber: { type: String, trim: true, default: '' },
    studentId: { type: String, trim: true, default: '' },
    studentMajor: { type: String, trim: true, default: '' },
    studentMinor: { type: String, trim: true, default: '' },
    studentEmailAddress: { type: String, trim: true, default: '' },
    studentMobileNumber: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'InternshipContract',
  internshipContractSchema,
  'internshipcontacts'
);
