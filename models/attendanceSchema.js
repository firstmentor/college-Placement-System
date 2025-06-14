const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hod",
    required: true
  }
});

module.exports = mongoose.model("attendance", attendanceSchema);
