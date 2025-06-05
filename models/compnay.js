const mongoose = require('mongoose');

const CompnaySchema =mongoose.Schema({
    name:{
        type :String,
        required: true,
    },
    email:{
        type :String,
        required: true,
    },
    password:{
        type :String,
        required: true,
    },
    phone:{
        type :String,
        required: true,
    },
    address:{
        type :String,
        required: true,
    },
    website:{
        type :String,
        required: true,
    },
    role:{
        type:String,
        default:"hod"
        
    },
    image: {
        public_id: { type: String },
        url: { type: String },
    },
    

})
const CompnayModel =mongoose.model('compnay',CompnaySchema)

module.exports =CompnayModel