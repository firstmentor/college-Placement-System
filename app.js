const express = require('express')
const app =express()
const web =require('./routes/web')
const connectDb =require('./database/dbcon')
const flash = require('connect-flash');
const session = require('express-session')
const setUserInfo = require('./middlewares/setUserInfo');
const fileUpload =require('express-fileupload')

require('dotenv').config()



//image upload form se controller ke pass jati hai
app.use(fileUpload({
    useTempFiles : true,
   
}));

const cookieParser = require('cookie-parser')
//token get cookies

app.use(cookieParser())
app.use(setUserInfo);



// messages
app.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false,
}));
// Flash messages
app.use(flash())







//connectdb
connectDb()
//view ejs
app.set('view engine', 'ejs')
//css image js link
app.use(express.static('public'))

//data get parse application/x-www-form-urlencoded
app.use(express.urlencoded())








//route load
app.use('/',web)

//server start
app.listen(process.env.PORT,()=>{
    console.log(`server start localhost:${process.env.PORT}`)
})



