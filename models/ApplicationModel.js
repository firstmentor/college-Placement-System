const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job', // Reference to JobModel
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student', // Reference to StudentModel
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Selected'],
    default: 'Applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
