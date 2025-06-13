const StudentModel = require("../models/student");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const sendMail = require("../Utility/sendMail");
const HodModel = require("../models/hod");
const path = require('path');
const fs = require('fs');

//setup
cloudinary.config({
  cloud_name: "dlgrvoo5l",
  api_key: "327727556398188",
  api_secret: "P3f1N_HOoWuv6gwKP_FsAGsirck",
});

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

      const hashedPassword = await bcrypt.hash(password, 10); // if you use bcrypt

      let imageData = {
        public_id: "",
        url: "",
      };

      if (req.files && req.files.image) {
        const imagefile = req.files.image;
        const imageupload = await cloudinary.uploader.upload(
          imagefile.tempFilePath,
          { folder: "userprofile" }
        );
        imageData.public_id = imageupload.public_id;
        imageData.url = imageupload.secure_url;
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
        registeredBy: req.user.role, // admin or hod
      });

      await newStudent.save();

      // Send email
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
      // console.log(id)
      await StudentModel.findByIdAndDelete(id);
      req.flash("success", "Student Delete successfully!");
      return res.redirect("/student/display");
    } catch (error) {
      console.log(error);
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

      if (req.files) {
        const student = await StudentModel.findById(id);
        const imageID = student.image.public_id;
        // console.log(imageID);

        //deleting image from Cloudinary
        await cloudinary.uploader.destroy(imageID);
        //new image update
        const imagefile = req.files.image;
        const imageupload = await cloudinary.uploader.upload(
          imagefile.tempFilePath,
          {
            folder: "userprofile",
          }
        );

        var data = {
          rollNumber,
          name,
          address,
          gender,
          email,
          dob,
          phone,
          branch,
          semester,
          image: {
            public_id: imageupload.public_id,
            url: imageupload.secure_url,
          },
        };
      } else {
        var data = {
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
      }
      await StudentModel.findByIdAndUpdate(id, data);
      req.flash("success", "Update Profile successfully");
      res.redirect("/student/display");
    } catch (error) {
      console.log(error);
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
        success: req.flash("succes"),
      });
    } catch (error) {
      console.log(error);
    }
  };

  static studentUpdateinfo = async (req, res) => {
    try {
      console.log(req.body)
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
  
      // Resume Upload Handling
      let resumePath = student.resume; // Keep old if not updated
      if (req.file) {
        // Delete old resume if exists
        if (student.resume) {
          const oldPath = path.join(__dirname, '..', 'public', 'uploads', student.resume);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        resumePath = req.file.filename; // New uploaded file name
      }
  
      await StudentModel.findByIdAndUpdate(studentId, {
        Xyear,
        Xmarks,
        XIIyear,
        XIImarks,
        GraYear,
        GraCGPA,
        resume: resumePath,
      });
  
      req.flash('success', 'Student info updated successfully');
      res.redirect('/student/profile'); // Or wherever appropriate
  
    } catch (error) {
      console.log(error);
      req.flash('error', 'Something went wrong');
      res.redirect('back');
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
}
module.exports = StudentController;
