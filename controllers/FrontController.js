const AdminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StudentModel = require("../models/student");
const HodModel = require("../models/hod");
const CompanyModel = require("../models/compnay");
const JobModel = require("../models/job");
const SelectedStudent = require("../models/student");
const ApplicationModel = require('../models/ApplicationModel')

class FrontController {
  static home = async (req, res) => {
    try {
      res.render("home");
    } catch (error) {
      console.log(error);
    }
  };

  static about = async (req, res) => {
    try {
      res.render("about");
    } catch (error) {
      console.log(error);
    }
  };
  static contact = async (req, res) => {
    try {
      res.render("contact");
    } catch (error) {
      console.log(error);
    }
  };
  static login = async (req, res) => {
    try {
      res.render("login", {
        msg: req.flash("error"),
        success: req.flash("success"),
      });
    } catch (error) {
      console.log(error);
    }
  };

  static register = async (req, res) => {
    try {
      res.render("register");
    } catch (error) {
      console.log(error);
    }
  };

  static dashboard = async (req, res) => {
    try {
      const role = req.user.role;
      const name = req.user.name;
  
      let stats = {};
  
      if (role === 'admin') {
        stats.totalStudents = await StudentModel.countDocuments();
        stats.totalHods = await HodModel.countDocuments();
        stats.totalCompanies = await CompanyModel.countDocuments();
        stats.totalJobs = await JobModel.countDocuments();
        stats.selectedStudents = await ApplicationModel.countDocuments({ status: 'Selected' }); // ✅ Add this

      } else if (role === 'hod') {
        const hod = await HodModel.findOne({ email: req.user.email });
        const dept = hod.department;
        // console.log(dept)
        stats.deptStudents = await StudentModel.countDocuments({ branch: dept });
        // console.log(stats.deptStudents)
        stats.appliedStudents = await ApplicationModel.countDocuments({ branch: dept });
        stats.selectedStudents = await ApplicationModel.countDocuments({ branch: dept, status: 'Selected' });
      } else if (role === 'company') {
        const companyId = req.user.id;
        stats.jobsPosted = await JobModel.countDocuments({ companyId });
        stats.totalApplications = await ApplicationModel.countDocuments({ companyId });
        console.log(stats.totalApplications)
        stats.hiredCount = await ApplicationModel.countDocuments({ companyId, status: 'Selected' });
      } else if (role === 'student') {
        stats.availableJobs = await JobModel.countDocuments();
        stats.jobsApplied = await ApplicationModel.countDocuments({ studentId: req.user.id });
        stats.interviews = await ApplicationModel.countDocuments({ studentId: req.user.id, status: 'Interview Scheduled' });
      }
  
      res.render("dashboard", {
        role,
        name,
        stats,
      });
    } catch (error) {
      console.log(error);
      req.flash("error", "Dashboard error");
      res.redirect("/login");
    }
  };
  
  
  
  

  static registerAdmin = async (req, res) => {
    try {
      //    console.log(req.body)
      const { name, email, password } = req.body;
      const hashPassword = await bcrypt.hash(password, 10);
      const result = await AdminModel.create({
        name,
        email,
        password: hashPassword,
      });
      res.redirect("/login"); //web
    } catch (error) {
      console.log(error);
    }
  };

  static verifyLogin = async (req, res) => {
    try {
      // console.log("hello")
      const { email, password, role } = req.body;
      if (!role) {
        req.flash("error", "Please select your role");
        return res.redirect("/login");
      }
      let user;

      switch (role) {
        case "admin":
          user = await AdminModel.findOne({ email });
          break;
        case "hod":
          user = await HodModel.findOne({ email });
          break;
        case "company":
          user = await CompanyModel.findOne({ email });
          break;
        case "student":
          user = await StudentModel.findOne({ email });
          break;
        default:
          req.flash("error", "Invalid role selected");
          return res.redirect("/login");
      }
      if (!user) {
        req.flash("error", "User not registered");
        return res.redirect("/login");
      }

      // ✅ Only check status for students
      if (user.role === "student" && user.status !== "active") {
        req.flash("error", "Your account is not active. Contact admin.");
        return res.redirect("/login");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("error", "Email or Password not match");
        return res.redirect("/login");
      }
      console.log(isMatch)
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: role, name: user.name ,email:user.email},
        process.env.jwt_secret_key, // secret key — ise environment variable me rakhna best practice hai
        { expiresIn: "1d" }
      );
      // console.log(token)

      // Store token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      }); // 1 day
      // 1 day = 24 hours = 24 * 60 minutes = 24 * 60 * 60 seconds = 86400 seconds
      // 24 hours 60 minutes per hour 60 seconds per minute 1000 milliseconds per second
      // 1 din ke milliseconds — yani 86,400,000 milliseconds.
      // httpOnly: true matlab ye cookie sirf backend ke liye accessible hai (JavaScript se nahi)
      // Cookie = Browser mein chhoti file (data snippet) jo website ke liye info rakhti hai.
      // Session = Server side memory jo user ke info ko temporarily store karta hai.
      // JWT in cookie = Secure token jo user ke identity ko verify karta hai, aur cookie ke through har request mein backend ko bheja jaata hai.

      return res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  static logout = async (req, res) => {
    try {
      res.clearCookie("token"); // JWT cookie ko clear kar do
      req.flash("success", "Logged out successfully");
      res.redirect("/login");
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = FrontController;
