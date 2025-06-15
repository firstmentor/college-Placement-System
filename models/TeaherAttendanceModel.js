// models/attendanceModel.js
const mongoose = require("mongoose");

const TeacherattendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  date: { type: String, required: true },
  time: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model("TeacherAttendance", TeacherattendanceSchema);
