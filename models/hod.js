const mongoose = require('mongoose');

const HodSchema =mongoose.Schema({
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
    gender:{
        type :String,
        required: true,
    },
    address:{
        type :String,
        required: true,
    },
    department:{
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
const HodModel =mongoose.model('hod',HodSchema)

module.exports =HodModel