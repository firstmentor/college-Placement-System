const express = require('express')
const app = express()
const web = require('./routes/web')
const connectDb = require('./database/dbcon')
const flash = require('connect-flash');
const session = require('express-session')
const setUserInfo = require('./middlewares/setUserInfo');
const cookieParser = require('cookie-parser')
require('dotenv').config()

// ❌ REMOVE THIS
// const fileUpload = require('express-fileupload')
// app.use(fileUpload({ useTempFiles: true }));

// ✅ Use only multer (from your /config/upload.js)

// Middleware for cookies
app.use(cookieParser())
app.use(setUserInfo);

// Session + flash
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
}));
app.use(flash())

// Connect DB
connectDb()

// View engine
app.set('view engine', 'ejs')

// Static folder
app.use(express.static('public'))

// Required for form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅

app.use('/', web)

// Server
app.listen(process.env.PORT, () => {
    console.log(`server start localhost:${process.env.PORT}`)
})
