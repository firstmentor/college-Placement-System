const HodModel = require("../models/hod");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const StudentModel = require('../models/student')
const { cloudinary } = require("../config/cloudinary");
const ApplicationModel = require('../models/ApplicationModel');
const AttendanceModel =require('../models/attendanceSchema')




class HodController {
  static display = async (req, res) => {
    try {
      const role = req.user.role;
  
      if (role === "administrator") {
        // Admin: show all HODs, latest first
        const hod = await HodModel.find().sort({ _id: -1 });
  
        return res.render("hod/display", {
          role,
          name: req.user.name,
          error: req.flash("error"),
          success: req.flash("success"),
          hod,           // List of HODs
          students: [],  // Optional: for safety in EJS
        });
      }
  
      if (role === "teacher") {
        const email = req.user.email;
        const hodData = await HodModel.findOne({ email });
  
        if (hodData) {
          const department = hodData.department;
          const students = await StudentModel.find({ branch: department }).sort({ _id: -1 });
  
          return res.render("hod/display", {
            role,
            name: req.user.name,
            error: req.flash("error"),
            success: req.flash("success"),
            students,
            hod: [],  // Optional: for safety in EJS
          });
        } else {
          req.flash("error", "Teacher not found");
          return res.redirect("/dashboard");
        }
      }
  
      // Other roles
      req.flash("error", "Unauthorized access");
      return res.redirect("/dashboard");
  
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      return res.redirect("/dashboard");
    }
  };
  
  
  

  static insertHod = async (req, res) => {
    try {
      const { name, address, gender, department, email, phone, password } = req.body;
  
      const existingHOD = await HodModel.findOne({ email });
      if (existingHOD) {
        req.flash("error", "Email already registered");
        return res.redirect("/hod/display");
      }
  
      let imageData = {
        public_id: "",
        url: "",
      };
  
      // ✅ Check if file uploaded
      if (req.file) {
        imageData = {
          public_id: req.file.filename,
          url: req.file.path,
        };
      }
  
      const hashPassword = await bcrypt.hash(password, 10);
  
      const result = await HodModel.create({
        name,
        address,
        gender,
        department,
        email,
        phone,
        password: hashPassword,
        image: imageData,
      });
  
      // ✅ Email Sending
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: `"PNINFOSYS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Jiwaji University Gwalior",
        html: `
          <h3>Dear ${name},</h3>
          <p>You have been successfully registered as HOD in the Jiwaji University Gwalior.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Use the above credentials to login.</p>
          <br>
          <p>Thanks & Regards,<br>Jiwaji University Gwalior</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      req.flash("success", "HOD registered and email sent successfully!");
      return res.redirect("/hod/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      return res.redirect("/hod/display");
    }
  };
  
  static hodDelete = async (req, res) => {
    try {
      const id = req.params.id;
  
      // Step 1: पहले HOD details लो ताकि image public_id मिल जाए
      const hod = await HodModel.findById(id);
      if (!hod) {
        req.flash("error", "HOD not found");
        return res.redirect("/hod/display");
      }
  
      // Step 2: Cloudinary से image delete करो
      if (hod.image && hod.image.public_id) {
        await cloudinary.uploader.destroy(hod.image.public_id);
      }
  
      // Step 3: Database से HOD delete करो
      await HodModel.findByIdAndDelete(id);
  
      req.flash("success", "HOD deleted successfully and image removed!");
      return res.redirect("/hod/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Failed to delete HOD.");
      return res.redirect("/hod/display");
    }
  };

  static hodEdit = async (req, res) => {
    try {
      const id = req.params.id;
  
      // Step 1: पहले HOD details लो ताकि image public_id मिल जाए
      const hod = await HodModel.findById(id);
      res.render('hod/edit',{hod,success:req.flash('success'),error:req.flash('error')})
    } catch (error) {
      console.log(error);
      req.flash("error", "Failed to delete HOD.");
      return res.redirect("/hod/display");
    }
  };
  
  static hodUpdate = async (req, res) => {
    try {
      const id = req.params.id;
      const {
        name,
        address,
        gender,
        department,
        email,
        phone,
        password,
      } = req.body;
  
      const hod = await HodModel.findById(id);
      if (!hod) {
        req.flash("error", "HOD not found");
        return res.redirect("/hod/display");
      }
  
      let imageData = hod.image; // default: old image
  
      // ✅ If new image is uploaded
      if (req.file) {
        // Step 1: Delete old image from Cloudinary
        if (hod.image && hod.image.public_id) {
          await cloudinary.uploader.destroy(hod.image.public_id);
        }
  
        // Step 2: Upload new image
        const imageUpload = await cloudinary.uploader.upload(req.file.path, {
          folder: "hod image",
        });
  
        imageData = {
          public_id: imageUpload.public_id,
          url: imageUpload.secure_url,
        };
      }
  
      // ✅ Password update (optional): hash only if provided
      let hashedPassword = hod.password;
      if (password && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
      }
  
      // ✅ Update document
      await HodModel.findByIdAndUpdate(id, {
        name,
        address,
        gender,
        department,
        email,
        phone,
        password: hashedPassword,
        image: imageData,
      });
  
      req.flash("success", "HOD updated successfully!");
      return res.redirect("/hod/display");
  
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong during update.");
      return res.redirect("/hod/display");
    }
  };


  static async departmentWiseApplications(req, res) {
    try {
      const department = req.user.department; // HOD's department
  
      // Step 1: Get students of this department
      const students = await StudentModel.find({ branch: department }, '_id'); // ✅ use 'branch' not 'department' in StudentModel
      const studentIds = students.map((s) => s._id);
  
      // Step 2: Get applications of those students
      const applications = await ApplicationModel.find({
        studentId: { $in: studentIds },
      })
        .populate({
          path: 'studentId',
          select: 'name email image branch resume',
        })
        .populate({
          path: "jobId",
          model: "Job",
          populate: {
            path: "companyId",
            model: "compnay", // ✅ Corrected spelling
            select: "name",   // ✅ Fixed spelling
          },
        })
        .sort({ appliedAt: -1 });
  
      res.render('hod/department-applications', {
        applications,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error in departmentWiseApplications:", error);
      req.flash("error", "Failed to fetch applications");
      res.render('hod/department-applications', { applications: [] });
    }
  }
  


  

 

  
  
  

  

 
  
  
}
module.exports = HodController;
