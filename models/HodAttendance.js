const mongoose = require("mongoose");

const hodAttendanceSchema = new mongoose.Schema({
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hod",
    required: true,
  },
  date: {
    type: String, // Store as 'YYYY-MM-DD'
    required: true,
  },
  time: {
    type: String, // Store time of marking
    required: true,
  },
});

hodAttendanceSchema.index({ hodId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HodAttendance", hodAttendanceSchema);
