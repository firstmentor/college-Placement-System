const express = require('express')
const FrontController = require('../controllers/FrontController')
const StudentController = require('../controllers/StudentController')
const HodController = require('../controllers/HodController')
const checkAuth =require('../middlewares/auth')
const route =express.Router()



route.get('/',FrontController.home)
route.get('/about',FrontController.about)
route.get('/contact',FrontController.contact)
route.get('/login',FrontController.login)
route.get('/register',FrontController.register)
route.get('/dashboard',checkAuth,FrontController.dashboard)

//insert admin login
route.post('/registerAdmin',FrontController.registerAdmin)
route.post('/verifyLogin',FrontController.verifyLogin)




//student controlelr
route.get('/student/display',checkAuth,StudentController.display)




//hod Controller
route.get('/hod/display',checkAuth,HodController.display)










module.exports =route