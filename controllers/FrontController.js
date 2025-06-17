const AdminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StudentModel = require("../models/student");
const HodModel = require("../models/hod");
const CompanyModel = require("../models/compnay");
const JobModel = require("../models/job");
const SelectedStudent = require("../models/student");
const ApplicationModel = require('../models/ApplicationModel')
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
      let isComplete = true;
  
      if (role === 'administrator') {
        stats.totalStudents = await StudentModel.countDocuments();
        stats.totalHods = await HodModel.countDocuments();
        stats.totalCompanies = await CompanyModel.countDocuments();
        stats.totalJobs = await JobModel.countDocuments();
        stats.selectedStudents = await ApplicationModel.countDocuments({ status: 'Selected' });
  
      } else if (role === 'teacher') {
        const hod = await HodModel.findOne({ email: req.user.email });
        const dept = hod.department;
  
        stats.deptStudents = await StudentModel.countDocuments({ branch: dept });
        stats.appliedStudents = await ApplicationModel.countDocuments({ branch: dept });
        stats.selectedInDept = await ApplicationModel.countDocuments({ branch: dept, status: 'Selected' });
  
      } else if (role === 'company') {
        const companyId = req.user.id;
  
        stats.jobsPosted = await JobModel.countDocuments({ companyId });
        stats.totalApplications = await ApplicationModel.countDocuments({ companyId });
        stats.selectedStudents = await ApplicationModel.countDocuments({ companyId, status: 'Selected' });
  
      } else if (role === 'student') {
        stats.availableJobs = await JobModel.countDocuments();
        stats.appliedJobs = await ApplicationModel.countDocuments({ studentId: req.user.id });
        stats.statusPending = await ApplicationModel.countDocuments({ studentId: req.user.id, status: 'Pending' });
        stats.statusSelected = await ApplicationModel.countDocuments({ studentId: req.user.id, status: 'Selected' });
  
        const student = await StudentModel.findOne({ email: req.user.email });
        isComplete = !!(student?.Xmarks && student?.XIImarks && student?.GraCGPA && student?.resume);
      }
  
      res.render("dashboard", {
        role,
        name,
        stats,
        isComplete, // 🔥 Pass for student alert
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
        case "administrator":
          user = await AdminModel.findOne({ email });
          break;
        case "teacher":
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
        { id: user._id, role: role, name: user.name ,email:user.email, department:user.department ,image:user.image},
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

  static changePasswordPage(req, res) {
    res.render('change-password', {
      error: req.flash('error'),
      success: req.flash('success'),
      user: req.user,
    });
  }
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      // Identify correct model
      let Model;
      if (role === 'admin') Model = AdminModel;
      else if (role === 'hod') Model = HODModel;
      else if (role === 'company') Model = CompanyModel;
      else if (role === 'student') Model = StudentModel;
      else throw new Error('Invalid Role');

      const user = await Model.findById(userId);
      if (!user) throw new Error('User not found');

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        req.flash('error', 'Old password is incorrect.');
        return res.redirect('/change-password');
      }

      if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match.');
        return res.redirect('/change-password');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      req.flash('success', 'Password changed successfully.');
      res.redirect('/change-password');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/change-password');
    }
  }


   // Show forgot password form
  static forgotPasswordForm(req, res) {
    res.render("forgot-password", {
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }

  static async forgotPassword(req, res) {
    try {
      const { email, role } = req.body;
      let user;
      let model;
  
      // Determine which model to use based on role
      switch (role) {
        case "admin":
          model = AdminModel;
          break;
        case "hod":
          model = HodModel;
          break;
        case "student":
          model = StudentModel;
          break;
        case "company":
          model = CompanyModel;
          break;
        default:
          req.flash("error", "Invalid role");
          return res.redirect("/forgot-password");
      }
  
      user = await model.findOne({ email });
  
      if (!user) {
        req.flash("error", `No ${role} found with that email`);
        return res.redirect("/forgot-password");
      }
  
      // Generate and save token
      const token = crypto.randomBytes(20).toString("hex");
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save();
  
      // Email setup
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS,
        },
      });
  
      const resetURL = `http://${req.headers.host}/reset-password/${role}/${token}`;
  
      await transporter.sendMail({
        to: user.email,
        from: "no-reply@pninfosys.com",
        subject: "Password Reset Request",
        html: `<p>You requested a password reset.</p>
               <p>Click <a href="${resetURL}">here</a> to reset your password.</p>`,
      });
  
      req.flash("success", "Reset link sent to your email");
      res.redirect("/forgot-password");
    } catch (err) {
      console.log(err);
      req.flash("error", "Something went wrong");
      res.redirect("/forgot-password");
    }
  }

  static getModelByRole(role) {
    // console.log(role)
    switch (role) {
      case "admin":
        return AdminModel;
      case "hod":
        return HodModel;
      case "student":
        return StudentModel;
      case "company":
        return CompanyModel;
      default:
        return null;
    }
  }

  static async getResetPassword(req, res) {
    try {
      const { role, token } = req.params;
      console.log(role,token)
      const Model = FrontController.getModelByRole(role);
      console.log(Model)

      if (!Model) {
        req.flash("error", "Invalid role");
        return res.redirect("/login");
      }

      const user = await Model.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        req.flash("error", "Invalid or expired token");
        return res.redirect("/forgot-password");
      }

      res.render("reset-password", { token, role });
    } catch (err) {
      console.log(err);
      req.flash("error", "Server error");
      res.redirect("/forgot-password");
    }
  }

  static async postResetPassword(req, res) {
    try {
      const { role, token } = req.params;
      const { password, confirmPassword } = req.body;
      const Model = FrontController.getModelByRole(role);
      console.log(Model)

      if (!Model) {
        req.flash("error", "Invalid role");
        return res.redirect("/login");
      }

      const user = await Model.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        req.flash("error", "Invalid or expired token");
        return res.redirect("/forgot-password");
      }

      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("back");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      req.flash("success", "Password reset successfully");
      res.redirect("/login");
    } catch (err) {
      console.log(err);
      req.flash("error", "Something went wrong");
      res.redirect("/forgot-password");
    }
  }
  
}
module.exports = FrontController;
