const express = require('express')
const FrontController = require('../controllers/FrontController')
const StudentController = require('../controllers/StudentController')
const HodController = require('../controllers/HodController')
const checkAuth =require('../middlewares/auth')
const CompnayController = require('../controllers/CompnayController')
const JobControlelr = require('../controllers/JobController')
const route =express.Router()
const upload = require('../middlewares/multer');




route.get('/',FrontController.home)
route.get('/about',FrontController.about)
route.get('/contact',FrontController.contact)
route.get('/login',FrontController.login)
route.get('/register',FrontController.register)
route.get('/dashboard',checkAuth,FrontController.dashboard)

//insert admin login
route.post('/registerAdmin',FrontController.registerAdmin)
route.post('/verifyLogin',FrontController.verifyLogin)
route.get('/logout',FrontController.logout)




//student controlelr
route.get('/student/display',checkAuth,StudentController.display)
route.post('/student/insert',checkAuth,StudentController.studentInsert)
route.get('/studentDelete/:id',checkAuth,StudentController.studentDelete)
route.get('/studentView/:id',checkAuth,StudentController.studentView)
route.get('/studentEdit/:id',checkAuth,StudentController.studentEdit)
route.post('/studentUpdate/:id',checkAuth,StudentController.studentUpdate)
//
route.post('/student/status/:id', checkAuth, StudentController.toggleStatus);














//update info student
route.get('/uddateinfoStudent/',checkAuth,StudentController.uddateinfoStudent)
route.post('/studentUpdateInfo/:id', upload.single('resume'),StudentController.studentUpdateinfo)











//hod Controller
route.get('/hod/display',checkAuth,HodController.display)
route.post('/inserthod',checkAuth,HodController.insertHod)
route.get('/hodDelete/:id',checkAuth,HodController.hodDelete)



//compnay controller
route.get('/company/display',checkAuth,CompnayController.display)
route.post('/compnayInsert',checkAuth,CompnayController.compnayInsert)



///company Openings/display job
route.get('/company/jobs',checkAuth,JobControlelr.AllJobs)
route.post('/company/jobs/add',checkAuth,JobControlelr.AddJob)
route.post('/company/jobs/Update/:id',checkAuth,JobControlelr.updateJob)
route.post('/compnay/job/delete/:id', JobControlelr.deleteJob);



//Student ke liye job list
route.get('/student/jobs',checkAuth,JobControlelr.showJobsForStudent);
route.post("/student/apply/:jobId", JobControlelr.applyJob);










route.get('/SelectedStudent/display',checkAuth,JobControlelr.SelectedStudent)















module.exports =route