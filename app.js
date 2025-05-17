const express = require('express')
const app =express()
const port =4000
const web =require('./routes/web')
const connectDb =require('./database/dbcon')
const flash = require('connect-flash');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const setUserInfo = require('./middlewares/setUserInfo');




// messages
app.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false,
}));
// Flash messages
app.use(flash())

//token get cookies
app.use(cookieParser())

app.use(setUserInfo);




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
app.listen(port,()=>{
    console.log(`server start localhost:${port}`)
})



