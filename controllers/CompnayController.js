const CompnayModel = require("../models/compnay");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { cloudinary } = require("../config/cloudinary");
const ApplicationModel = require('../models/ApplicationModel')
const JobModel = require('../models/job')
require('dotenv').config()


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID, // e.g. your@gmail.com
    pass: process.env.MAIL_PASS, // use App Password if Gmail
  },
});


class CompnayController {
  static display = async (req, res) => {
    try {
      const company = await CompnayModel.find();
      res.render("company/display", {
        success: req.flash("success"),
        error: req.flash("error"),
        company,
      }); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };

  static compnayInsert = async (req, res) => {
    try {
      const { name, address, website, email, phone, password } = req.body;

      const existingCompany = await CompnayModel.findOne({ email });
      if (existingCompany) {
        req.flash("error", "Email already registered");
        return res.redirect("/company/display");
      }

      // ✅ image uploaded by multer + cloudinary
      let imageData = { public_id: "", url: "" };
      if (req.file) {
        imageData = {
          public_id: req.file.filename,
          url: req.file.path,
        };
      }

      const hashPassword = await bcrypt.hash(password, 10);

      await CompnayModel.create({
        name,
        address,
        website,
        email,
        phone,
        password: hashPassword,
        image: imageData,
      });

      // ✅ send mail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"PNINFOSYS" <${process.env.MAIL_ID}>`,
        to: email,
        subject: "Welcome to Jiwaji University Gwalior",
        html: `
            <h3>Dear ${name},</h3>
            <p>You have been successfully registered as a company.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>You can now log in and start posting jobs.</p>
            <br><p>Regards,<br>Jiwaji University Gwalior</p>
          `,
      };

      await transporter.sendMail(mailOptions);

      req.flash("success", "Company registered and email sent successfully!");
      res.redirect("/company/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      res.redirect("/company/display");
    }
  };

  static companyEdit = async (req, res) => {
    try {
      const company = await CompnayModel.findById(req.params.id);
      // console.log(company)
      res.render("company/Edit", {
        success: req.flash("success"),
        error: req.flash("error"),
        company,
      }); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };

  static companyUpdate = async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const { name, address, website, email, phone } = req.body;

      const company = await CompnayModel.findById(id);

      if (!company) {
        req.flash("error", "Company not found");
        return res.redirect("/company/display");
      }

      let imageData = company.image; // keep existing image by default

      // ✅ If new image uploaded, delete old one from Cloudinary and update
      if (req.file) {
        if (company.image && company.image.public_id) {
          await cloudinary.uploader.destroy(company.image.public_id);
        }

        imageData = {
          public_id: req.file.filename,
          url: req.file.path,
        };
      }

      await CompnayModel.findByIdAndUpdate(id, {
        name,
        address,
        website,
        email,
        phone,
        image: imageData,
      });

      req.flash("success", "Company updated successfully");
      res.redirect("/company/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Update failed");
      res.redirect("/company/display");
    }
  };

  static companyDelete = async (req, res) => {
    try {
      const id = req.params.id;
      const company = await CompnayModel.findById(id);

      if (!company) {
        req.flash("error", "Company not found");
        return res.redirect("/company/display");
      }

      // ✅ Delete Cloudinary image
      if (company.image && company.image.public_id) {
        await cloudinary.uploader.destroy(company.image.public_id);
      }

      await CompnayModel.findByIdAndDelete(id);

      req.flash("success", "Company deleted successfully");
      res.redirect("/company/display");
    } catch (error) {
      console.log(error);
      req.flash("error", "Failed to delete company");
      res.redirect("/company/display");
    }
  };

  ///compnayOpneing
  static compnayOpneing = async (req, res) => {
    try {
      res.render("company/compnayOpneing"); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };

  static async companyViewApplications(req, res) {
    try {
      const companyId = req.user.id; // assuming company is logged in

      // Step 1: Find jobs posted by this company
      const jobs = await JobModel.find({ companyId }, "_id");

      // Step 2: Extract job IDs
      const jobIds = jobs.map((job) => job._id);

      // Step 3: Find applications for those jobs
      const applications = await ApplicationModel.find({
        jobId: { $in: jobIds },
      })
        .populate("studentId") // get student details
        .populate({
          path: "jobId",
          model: "Job", // ✅ Matches your Job model
         
          })// get job details
        .sort({ appliedAt: -1 });
        

      res.render("company/applications", {
        applications,
        success:req.flash('success')
      });
    } catch (err) {
      console.error(err);
      
    }
  }

  static async updateApplicationStatus(req, res) {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
  
      // Update application
      const updatedApplication = await ApplicationModel.findByIdAndUpdate(
        applicationId,
        { status },
        { new: true }
      ).populate("studentId").populate({
        path: "jobId",
        model: "Job", // ✅ Matches your Job model
       
        })
  
      // Send email to student
      const studentEmail = updatedApplication.studentId.email;
      const studentName = updatedApplication.studentId.name;
      const jobTitle = updatedApplication.jobId.title;
  
      const mailOptions = {
        from: process.env.MAIL_ID,
        to: studentEmail,
        subject: `Application Status Update - ${jobTitle}`,
        html: `
          <p>Dear ${studentName},</p>
          <p>Your application status for the job <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong>.</p>
          <p>Best of luck!</p>
          <p><b>Jiwaji University Gwaliorl</b></p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      req.flash("success", "Application status updated & email sent");
      res.redirect("/applications");
    } catch (err) {
      console.error("Error updating status or sending email:", err);
      
    }
  }
  
      
    
    
  
}
module.exports = CompnayController;
