const CompnayModel = require('../models/compnay')
const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt");




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


    static compnayInsert =async(req,res)=>{
        try {
        const { name, address, website, email, phone, password,image } =
            req.body;
          const existingHOD = await CompnayModel.findOne({ email });
          if (existingHOD) {
            req.flash("error", "Email already registered");
            return res.redirect("/hod/display");
          }
          //image uplaod
          const file = req.files.image;
          const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "company image",
          });
          // console.log(imageUpload);
          const hashPassword = await bcrypt.hash(password, 10);
         
          const result = await CompnayModel.create({
            
            name,
            address,
            website,
            email,
            phone,
            password:hashPassword,
            image: {
              public_id: imageUpload.public_id,
              url: imageUpload.secure_url
            }
    
          })
          req.flash("success","company registered successfully!")
          return res.redirect("/company/display")
            
        } catch (error) {
            console.log(error)
        }
    }
    
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