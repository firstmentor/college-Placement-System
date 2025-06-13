const mongoose = require('mongoose');
// CollegePlacementSystem //database name 

const connectDb =()=>{
    return mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("connect Db")
    }).catch((error)=>{
        console.log(error)
    })

}
module.exports =connectDb
