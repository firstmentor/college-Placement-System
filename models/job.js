const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  salary: {
    type: String,
    required: true,
  },

  department: {
    type: String,
    required: true,
  },

  jobType: {
    type: String,
    enum: ["Full-time", "Internship", "Contract"],
    default: "Full-time",
  },

  applicationDeadline: {
    type: Date,
  },

  status: {
    type: String,
    enum: ["open", "closed", "draft"],
    default: "open",
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "compnay", // company user
    required: true,
  },

  requirements: {
    min10Percent: {
      type: Number,
      min: 0,
      max: 100,
    },
    min12Percent: {
      type: Number,
      min: 0,
      max: 100,
    },
    minCGPA: {
      type: Number,
      min: 0,
      max: 10,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    allowedBranches: [String],
    skillsRequired: [String],
  },

  applicants: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
      },
      status: {
        type: String,
        enum: ["applied", "shortlisted", "rejected", "selected"],
        default: "applied",
      },
      appliedDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);
