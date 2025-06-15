const HodAttendance = require("../models/HodAttendance");
const moment = require("moment");

class HodAttendance{

    static async markAttendance(req, res) {
        try {
          const hodId = req.user.id;
          const date = moment().format("YYYY-MM-DD");
          const time = moment().format("HH:mm:ss");
      
          // Check if already marked
          const alreadyMarked = await HodAttendance.findOne({ hodId, date });
          if (alreadyMarked) {
            req.flash("error", "You have already marked attendance for today.");
            return res.redirect("/dashboard");
          }
      
          // Save attendance
          await HodAttendance.create({ hodId, date, time });
      
          req.flash("success", "Attendance marked successfully.");
          res.redirect("/dashboard");
        } catch (error) {
          console.log(error);
          req.flash("error", "Something went wrong.");
          res.redirect("/dashboard");
        }
      }



}
module.exports =HodAttendance