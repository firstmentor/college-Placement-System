const HodModel = require("../models/hod");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const nodemailer = require("nodemailer");
const StudentModel = require('../models/student')

//setup
cloudinary.config({
  cloud_name: "dlgrvoo5l",
  api_key: "327727556398188",
  api_secret: "P3f1N_HOoWuv6gwKP_FsAGsirck",
});

class HodController {
  static display = async (req, res) => {
    try {
      const role = req.user.role;
  
      if (role === "admin") {
        // Admin: show all HODs
        const hod = await HodModel.find();
  
        return res.render("hod/display", {
          role,
          name: req.user.name,
          error: req.flash("error"),
          success: req.flash("success"),
          hod,      // HOD list for admin
          students: [], // Optional: for safety in EJS
        });
      }
  
      if (role === "hod") {
        const email = req.user.email;
        const hodData = await HodModel.findOne({ email });
  
        if (hodData) {
          const department = hodData.department;
          const students = await StudentModel.find({ branch: department });
  
          return res.render("hod/display", {
            role,
            name: req.user.name,
            error: req.flash("error"),
            success: req.flash("success"),
            students,
            hod: [], // Optional: for safety in EJS
          });
        } else {
          req.flash("error", "HOD not found");
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
      const { name, address, gender, department, email, phone, password } =
        req.body;

      const existingHOD = await HodModel.findOne({ email });
      if (existingHOD) {
        req.flash("error", "Email already registered");
        return res.redirect("/hod/display");
      }

      const file = req.files.image;
      const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "hod image",
      });

      const hashPassword = await bcrypt.hash(password, 10);

      const result = await HodModel.create({
        name,
        address,
        gender,
        department,
        email,
        phone,
        password: hashPassword,
        image: {
          public_id: imageUpload.public_id,
          url: imageUpload.secure_url,
        },
      });

      // === Send Email to HOD ===
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_ID, // your email
          pass: process.env.MAIL_PASS, // your email password or app password
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
      // console.log(id)
      await HodModel.findByIdAndDelete(id);
      req.flash("success", "Hod Delete successfully!");
      return res.redirect("/hod/display");
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = HodController;
