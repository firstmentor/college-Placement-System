const mongoose = require('mongoose');

const AdminSchema =mongoose.Schema({
    name:{
        type :String,
        require
    },
    email:{
        type :String,
        require
    },
    password:{
        type :String,
        require
    },
    role:{
        type:String,
        default:"administrator"
        
    },
    resetToken:{
        type:String
    },
    resetTokenExpiry:{
        type:String
    }
    

})
const AdminModel =mongoose.model('admin',AdminSchema)

module.exports =AdminModel