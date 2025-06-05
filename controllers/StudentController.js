const StudentModel = require("../models/student");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");

//setup
cloudinary.config({
  cloud_name: "dlgrvoo5l",
  api_key: "327727556398188",
  api_secret: "P3f1N_HOoWuv6gwKP_FsAGsirck",
});

class StudentController {
  static display = async (req, res) => {
    try {
      const student = await StudentModel.find();
      // console.log(student)
      res.render("students/display", {
        role: req.user.role,
        name: req.user.name,
        error: req.flash("error"),
        success: req.flash("success"),
        std: student,
      }); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };

  static insertStudent = async (req, res) => {
    try {
      // console.log(req.files)
      // console.log(req.body)
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
      const existingStudent = await StudentModel.findOne({ email });
      const existingRoll = await StudentModel.findOne({ rollNumber });
      if (existingStudent) {
        req.flash("error", "Email already registered");
        return res.redirect("/student/display");
      }
      if (existingRoll) {
        req.flash("error", "RollNumber already registered");
        return res.redirect("/student/display");
      }
      //image uplaod
      const file = req.files.image;
      const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "student_images",
      });
      // console.log(imageUpload)

      const hashPassword = await bcrypt.hash(password, 10);

      const result = await StudentModel.create({
        rollNumber,
        name,
        address,
        gender,
        email,
        dob,
        phone,
        branch,
        semester,
        password: hashPassword,
        image: {
          public_id: imageUpload.public_id,
          url: imageUpload.secure_url,
        },
      });
      req.flash("success", "Student registered successfully!");
      return res.redirect("/student/display");
    } catch (error) {
      console.log(error);
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
    console.log(student)

    try {

      res.render('students/updateinfo',{edit:student})
    } catch (error) {
      console.log(error);
    }
  };

}
module.exports = StudentController;
