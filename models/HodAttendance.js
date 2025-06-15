const mongoose = require("mongoose");

const hodAttendanceSchema = new mongoose.Schema({
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hod",
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // Format: HH:mm:ss
    required: true,
  }
}, {
  timestamps: true
});

hodAttendanceSchema.index({ hodId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HodAttendance", hodAttendanceSchema);
