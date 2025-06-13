const StudentModel = require("../models/student");
const bcrypt = require("bcrypt");
const sendMail = require("../Utility/sendMail");
const HodModel = require("../models/hod");
const path = require('path');
const fs = require('fs');
const streamifier = require('streamifier');
const { cloudinary } = require("../config/cloudinary");
const ApplicationModel =require('../models/ApplicationModel')
const job = require('../models/job')





class StudentController {
  static display = async (req, res) => {
    try {
      const role = req.user.role;
      const name = req.user.name;

      let student = [];

      if (role === "admin") {
        // Admin: show all students
        student = await StudentModel.find();
      } else if (role === "hod") {
        // HOD: find own department from HOD model
        const email = req.user.email;
        const hodData = await HodModel.findOne({ email });

        if (hodData) {
          const dept = hodData.department;
          student = await StudentModel.find({ branch: dept });
        } else {
          req.flash("error", "HOD not found");
          return res.redirect("/dashboard");
        }
      } else {
        req.flash("error", "Unauthorized access");
        return res.redirect("/dashboard");
      }

      res.render("students/display", {
        role,
        name,
        error: req.flash("error"),
        success: req.flash("success"),
        std: student,
      });
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      return res.redirect("/dashboard");
    }
  };

  static studentInsert = async (req, res) => {
    try {
      const {
        rollNumber,
        name,
        address,
        gender,
        email,
        dob,
        phone,
        branch,
        semester,
      } = req.body;

      const password = "1234";
      const hashedPassword = await bcrypt.hash(password, 10);

      let imageData = {
        public_id: "",
        url: "",
      };

      if (req.file) {
        imageData.public_id = req.file.filename;
        imageData.url = req.file.path;
      }

      const newStudent = new StudentModel({
        rollNumber,
        name,
        address,
        gender,
        email,
        dob,
        phone,
        branch,
        semester,
        password: hashedPassword,
        image: imageData,
        registeredBy: req.user.role,
      });

      await newStudent.save();

      await sendMail(
        email,
        "Welcome to Jiwaji University Gwalior",
        `Dear ${name},\n\nYour account has been created.\n\nLogin Email: ${email}\nPassword: 1234\n\nThank you!`
      );

      req.flash("success", "Student registered successfully and email sent.");
      res.redirect("/student/display");

    } catch (err) {
      console.log(err);
      req.flash("error", "Failed to register student.");
      res.redirect("/student/display");
    }
  };


  static studentDelete = async (req, res) => {
    try {
      const id = req.params.id;
  
      const student = await StudentModel.findById(id);
      if (!student) {
        req.flash("error", "Student not found");
        return res.redirect("/student/display");
      }
  
      // Delete image from Cloudinary
      if (student.image && student.image.public_id) {
        await cloudinary.uploader.destroy(student.image.public_id);
      }
  
      // Delete student from DB
      await StudentModel.findByIdAndDelete(id);
  
      req.flash("success", "Student deleted successfully!");
      return res.redirect("/student/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      res.redirect("/student/display");
    }
  };
  

  static studentView = async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id)
      const view = await StudentModel.findById(id);
      // console.log(view)
      res.render("students/view", { view });
    } catch (error) {
      console.log(error);
    }
  };

  static studentEdit = async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id)
      const edit = await StudentModel.findById(id);
      // console.log(view)
      res.render("students/edit", { edit });
    } catch (error) {
      console.log(error);
    }
  };

  static studentUpdate = async (req, res) => {
    try {
      const id = req.params.id;
      const {
        rollNumber,
        name,
        address,
        gender,
        email,
        dob,
        phone,
        branch,
        semester,
        password,
      } = req.body;
  
      const student = await StudentModel.findById(id);
      if (!student) {
        req.flash("error", "Student not found");
        return res.redirect("/student/display");
      }
  
      let updatedData = {
        rollNumber,
        name,
        address,
        gender,
        email,
        dob,
        phone,
        branch,
        semester,
      };
  
      if (req.file) {
        // Delete old image from Cloudinary
        if (student.image && student.image.public_id) {
          await cloudinary.uploader.destroy(student.image.public_id);
        }
  
        // Upload new image to Cloudinary
        updatedData.image = {
          public_id: req.file.filename,
          url: req.file.path,
        };
      }
  
      await StudentModel.findByIdAndUpdate(id, updatedData);
  
      req.flash("success", "Profile updated successfully");
      res.redirect("/student/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      res.redirect("/student/display");
    }
  };
  
  //updatinfo
  static uddateinfoStudent = async (req, res) => {
    const student = await StudentModel.findById(req.user.id);
    // console.log(student)

    try {
      res.render("students/updateinfo", {
        edit: student,
        error: req.flash("error"),
        success: req.flash("success"),
      });
    } catch (error) {
      console.log(error);
    }
  };

 
  static studentUpdateinfo = async (req, res) => {
    // console.log("hello");
    try {
      
      console.log(req.body);
      
  
      const studentId = req.params.id;
      const {
        Xyear,
        Xmarks,
        XIIyear,
        XIImarks,
        GraYear,
        GraCGPA,
      } = req.body;
  
      const student = await StudentModel.findById(studentId);
      if (!student) {
        req.flash('error', 'Student not found');
        return res.redirect('back');
      }
  
      // === Handle Resume Upload to Cloudinary ===
      if (req.file) {
        // Delete old resume from Cloudinary
        if (student.resume && student.resume.public_id) {
          await cloudinary.uploader.destroy(student.resume.public_id, {
            resource_type: 'raw',
          });
        }
  
        // Cloudinary upload stream (for PDFs/Word docs)
        const bufferStream = streamifier.createReadStream(req.file.buffer);
  
        const cloudinaryUpload = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'student_resume',
                resource_type: 'raw',
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            bufferStream.pipe(stream);
          });
  
        const result = await cloudinaryUpload();
  
        // Update with new resume
        await StudentModel.findByIdAndUpdate(studentId, {
          Xyear,
          Xmarks,
          XIIyear,
          XIImarks,
          GraYear,
          GraCGPA,
          resume: {
            public_id: result.public_id,
            url: result.secure_url,
          },
        });
  
        req.flash('success', 'Student info and resume updated successfully');
        return res.redirect('/uddateinfoStudent');
  
      } else {
        // No resume uploaded, only academic info updated
        await StudentModel.findByIdAndUpdate(studentId, {
          Xyear,
          Xmarks,
          XIIyear,
          XIImarks,
          GraYear,
          GraCGPA,
        });
  
        req.flash('success', 'Student info updated successfully');
        return res.redirect('/uddateinfoStudent');
      }
    } catch (error) {
      console.error(error);
      req.flash('error', 'Something went wrong');
      return res.redirect('back');
    }
  };
  

  static toggleStatus = async (req, res) => {
    try {
      const student = await StudentModel.findById(req.params.id);
      const newStatus = student.status === "active" ? "inactive" : "active";
      await StudentModel.findByIdAndUpdate(req.params.id, {
        status: newStatus,
      });
      req.flash("success", `Student status changed to ${newStatus}`);
      res.redirect("/student/display");
    } catch (error) {
      console.log(error);
      res.redirect("/student/display");
    }
  };
  
  static myApplications = async (req, res) => {
      try {
        const studentId = req.user.id;
    
        // Get all applications by student
        const applications = await ApplicationModel.find({ studentId })
        .populate({
          path: "jobId",
          model: "Job", // ✅ Matches your Job model
          populate: {
            path: "companyId",
            model: "compnay", // ✅ Must match your corrected model ref
          },
          })
          .sort({ appliedAt: -1 }); // Newest first
          // console.log(applications)
    
        res.render("students/myApplications", {
          title: "My Applications",
          applications,
        });
    
      } catch (error) {
        console.log(error);
        req.flash("error", "Unable to fetch applications");
        res.redirect("/student/dashboard");
      }
    };


}
module.exports = StudentController;
