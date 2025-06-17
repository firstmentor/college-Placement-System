const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // ✅ Must match model name: mongoose.model('Job', ...)
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student', // ✅ Must match model name: mongoose.model('Student', ...)
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
