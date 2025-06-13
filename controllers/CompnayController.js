const CompnayModel = require('../models/compnay')
const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");





//setup
cloudinary.config({
  cloud_name: "dlgrvoo5l",
  api_key: "327727556398188",
  api_secret: "P3f1N_HOoWuv6gwKP_FsAGsirck",
});




class CompnayController{
    static display =async(req,res)=>{
        try {
            const company =await CompnayModel.find()
            res.render('company/display',{success:req.flash('success'),error:req.flash('error'),company}) //folder(student) display.ejs
        } catch (error) {
            console.log(error)
        }
    }


    static compnayInsert = async (req, res) => {
      try {
        const { name, address, website, email, phone, password } = req.body;
    
        const existingHOD = await CompnayModel.findOne({ email });
        if (existingHOD) {
          req.flash("error", "Email already registered");
          return res.redirect("/company/display");
        }
    
        // Image upload
        const file = req.files.image;
        const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "company image",
        });
    
        const hashPassword = await bcrypt.hash(password, 10);
    
        const result = await CompnayModel.create({
          name,
          address,
          website,
          email,
          phone,
          password: hashPassword,
          image: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
          }
        });
    
        // === Send Email to Company ===
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
            <p>You have been successfully registered as a company.</p>
            <p><strong>Login Credentials:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>You can now log in and start adding job postings.</p>
            <br>
            <p>Regards,<br>Jiwaji University Gwalior</p>
          `
        };
    
        await transporter.sendMail(mailOptions);
    
        req.flash("success", "Company registered and email sent successfully!");
        return res.redirect("/company/display");
    
      } catch (error) {
        console.log(error);
        req.flash("error", "Something went wrong");
        return res.redirect("/company/display");
      }
    };
    
    ///compnayOpneing
    static compnayOpneing =async(req,res)=>{
      try {
         
          res.render('company/compnayOpneing') //folder(student) display.ejs
      } catch (error) {
          console.log(error)
      }
  }

}
module.exports =CompnayController