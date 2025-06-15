const Attendance = require("../models/attendanceSchema");
const Student = require("../models/student");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

class AttendanceController {
  static addForm = async (req, res) => {
    try {
      const semester = req.query.semester;
      let filter = { branch: req.user.department };
      if (semester) {
        filter.semester = semester;
      }

      const students = await Student.find(filter);
      res.render("hod/attendanceForm", {
        students,
        semester,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.error("Error in addForm:", err);
      res.redirect("/error");
    }
  };

  // ✅ Insert multiple student attendance (POST)
  static async insertAttendance(req, res) {
    try {
      const { studentIds, status, date } = req.body;

      // Ensure studentIds is an array
      const studentArray = Array.isArray(studentIds)
        ? studentIds
        : [studentIds];

      for (let id of studentArray) {
        await Attendance.create({
          studentId: id,
          status,
          date,
          markedBy: req.user.id,
        });
      }

      req.flash("success", "Attendance marked successfully.");
      res.redirect("/hod/attendance/new");
    } catch (err) {
      console.log(err);
      req.flash("error", "Failed to mark attendance.");
      res.redirect("/hod/attendance/new");
    }
  }

  // ✅ View all attendance records (with optional date filter)
  static async viewAttendanceList(req, res) {
    try {
      const { date } = req.query;
      const filter = { markedBy: req.user.id };

      if (date) {
        const selectedDate = new Date(date);
        filter.date = { $eq: selectedDate };
      }

      const records = await Attendance.find(filter)
        .populate("studentId")
        .sort({ date: -1 });
      res.render("hod/attendanceList", { records, date });
    } catch (err) {
      console.log(err);
      req.flash("error", "Could not fetch attendance records.");
      res.redirect("/hod/dashboard");
    }
  }

  // ✅ Edit attendance form
  static async editAttendanceForm(req, res) {
    try {
      const record = await Attendance.findById(req.params.id).populate(
        "studentId"
      );
      res.render("hod/attendanceEdit", {
        record,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      console.log(err);
      req.flash("error", "Failed to load attendance record.");
      res.redirect("/hod/attendance");
    }
  }

  // ✅ Update attendance record
  static async updateAttendance(req, res) {
    try {
      const { status, date } = req.body;
      await Attendance.findByIdAndUpdate(req.params.id, { status, date });
      req.flash("success", "Attendance updated.");
      res.redirect("/hod/attendance");
    } catch (err) {
      console.log(err);
      req.flash("error", "Update failed.");
      res.redirect("/hod/attendance");
    }
  }

  // ✅ Delete attendance
  static async deleteAttendance(req, res) {
    try {
      await Attendance.findByIdAndDelete(req.params.id);
      req.flash("success", "Attendance deleted.");
      res.redirect("/hod/attendance");
    } catch (err) {
      console.log(err);
      req.flash("error", "Delete failed.");
      res.redirect("/hod/attendance");
    }
  }

  // static async attendanceReport(req, res) {
  //   const { branch, semester } = req.query;
  // const students = await Student.find({ branch: branch, semester });

  // const studentIds = students.map(s => s._id);
  // const records = await Attendance.find({ studentId: { $in: studentIds } })
  //   .populate("studentId")
  //   .sort({ date: -1 });

  // res.render("hod/attendanceReport", { records, branch, semester });
  // }
  static async attendanceReport(req, res) {
    try {
      const { branch, semester, month, year } = req.query;
      console.log(branch, semester, month, year);

      // Safeguard - validate numeric values
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (
        !branch ||
        !semester ||
        !monthNum ||
        !yearNum ||
        isNaN(monthNum) ||
        isNaN(yearNum)
      ) {
        return res.render("hod/attendanceReport", {
          records: [],
          branch: branch || "",
          semester: semester || "",
          month: month || "",
          year: year || "",
        });
      }

      // Filter students for this HOD
      const students = await Student.find({
        branch,
        semester,
        branch: req.user.department, // Ensure HOD can only access their branch
      });
      console.log(students);

      const studentIds = students.map((s) => s._id);

      // Properly create valid date range
      const startDate = new Date(yearNum, monthNum - 1, 1, 0, 0, 0); // 1st day of month
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // last day of month

      // Fetch attendance
      const records = await Attendance.find({
        studentId: { $in: studentIds },
        date: { $gte: startDate, $lte: endDate },
      })
        .populate("studentId")
        .sort({ date: -1 });
      //       console.log(startDate)
      //       console.log(records)

      //       console.log("Start:", startDate.toISOString());
      // console.log("End:", endDate.toISOString());
      // console.log("Students found:", studentIds);
      // console.log("Records found:", records.length);

      // Render
      res.render("hod/attendanceReport", {
        records,
        branch,
        semester,
        month,
        year,
      });
    } catch (err) {
      console.error("Error in attendanceReport:", err);
      res.status(500).send("Something went wrong.");
    }
  }

  static async exportPDF(req, res) {
    const { semester } = req.query;
    console.log(semester);
    console.log(req.user.department);
    const students = await Student.find({
      semester,
      branch: req.user.department,
    }).select("_id");
    console.log(students);
    const studentIds = students.map((s) => s._id);
    console.log(studentIds);

    const records = await Attendance.find({
      studentId: { $in: studentIds },
    }).populate("studentId");

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Attendance_Report.pdf"'
    );
    doc.pipe(res);

    doc.fontSize(18).text("Attendance Report", { align: "center" });
    doc.moveDown();

    records.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `Name: ${
            r.studentId.name
          } | Date: ${r.date.toDateString()} | Status: ${r.status}`
        );
    });

    doc.end();
  }

  static async exportExcel(req, res) {
    const { semester } = req.query;
    const students = await Student.find({
      semester,
      department: req.user.department,
    }).select("_id");
    const studentIds = students.map((s) => s._id);

    const records = await Attendance.find({
      studentId: { $in: studentIds },
    }).populate("studentId");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: "Student Name", key: "name" },
      { header: "Date", key: "date" },
      { header: "Status", key: "status" },
    ];

    records.forEach((r) => {
      worksheet.addRow({
        name: r.studentId.name,
        date: r.date.toDateString(),
        status: r.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Attendance_Report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  static async monthlySummary(req, res) {
    const { month, year } = req.query;
    const hodDept = req.user.department;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const students = await Student.find({ department: hodDept }).select(
      "_id name"
    );

    let summary = [];

    for (const student of students) {
      const records = await Attendance.find({
        studentId: student._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const totalDays = records.length;
      const presentCount = records.filter((r) => r.status === "Present").length;
      const absentCount = totalDays - presentCount;

      summary.push({
        name: student.name,
        totalDays,
        presentCount,
        absentCount,
      });
    }

    res.render("hod/monthlySummary", { summary, month, year });
  }

  // controllers/AttendanceController.js studnet

  static async myAttendance(req, res) {
    try {
      const studentId = req.user.id;

      const { month, year } = req.query;

      let filter = { studentId };

      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);

        filter.date = { $gte: startDate, $lte: endDate };
      }

      const records = await Attendance.find(filter).sort({ date: -1 });
      console.log(records)

      res.render("students/myAttendance", {
        records,
        month: month || "",
        year: year || "",
      });
    } catch (err) {
      console.error("Error in myAttendance:", err);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = AttendanceController;
