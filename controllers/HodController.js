const HodModel = require("../models/hod");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");

//setup
cloudinary.config({
  cloud_name: "dlgrvoo5l",
  api_key: "327727556398188",
  api_secret: "P3f1N_HOoWuv6gwKP_FsAGsirck",
});

class HodController {
  static display = async (req, res) => {
    try {
      const hod =await HodModel.find()
      console.log(hod)
      res.render("hod/display", {
        role: req.user.role,
        name: req.user.name,
        error: req.flash("error"),
        success: req.flash("success"),
        hod
      }); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };
  static insertHod = async (req, res) => {
    try {
      // console.log(req.body)
      // console.log(req.files.image)
      const { name, address, gender, department, email, phone, password } =
        req.body;
      const existingHOD = await HodModel.findOne({ email });
      if (existingHOD) {
        req.flash("error", "Email already registered");
        return res.redirect("/hod/display");
      }
      //image uplaod
      const file = req.files.image;
      const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "hod image",
      });
      // console.log(imageUpload);
      const hashPassword = await bcrypt.hash(password, 10);
     
      const result = await HodModel.create({
        
        name,
        address,
        gender,
        department,
        email,
        phone,
        password:hashPassword,
        image: {
          public_id: imageUpload.public_id,
          url: imageUpload.secure_url
        }

      })
      req.flash("success","HOD registered successfully!")
      return res.redirect("/hod/display")

    } catch (error) {
      console.log(error);
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
