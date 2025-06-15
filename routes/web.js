const express = require('express')
const FrontController = require('../controllers/FrontController')
const StudentController = require('../controllers/StudentController')
const HodController = require('../controllers/HodController')
const checkAuth =require('../middlewares/auth')
// const upload1 = require('../config/upload'); // ✅ correct relative path
const upload = require("../middlewares/multer");
const uploadResume = require('../middlewares/uploadResume');
const { isStudent } = require("../middlewares/auth");






const CompnayController = require('../controllers/CompnayController')
const JobControlelr = require('../controllers/JobController')
const AttendanceController = require('../controllers/AttendanceController')
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
route.get('/logout',FrontController.logout)
route.get('/change-password', checkAuth, FrontController.changePasswordPage);
route.post('/change-password', checkAuth, FrontController.changePassword);

//forget passowrd
route.get('/forgot-password',FrontController.forgotPasswordForm)
route.post('/forgot-password1',FrontController.forgotPassword)
route.get("/reset-password/:role/:token", FrontController.getResetPassword);
route.post("/reset-password/:role/:token", FrontController.postResetPassword);











//student controlelr
route.get('/student/display',checkAuth,StudentController.display)
route.post('/student/insert',checkAuth, upload.single("image"),StudentController.studentInsert)
route.get('/studentDelete/:id',checkAuth,StudentController.studentDelete)
route.get('/studentView/:id',checkAuth,StudentController.studentView)
route.get('/studentEdit/:id',checkAuth,StudentController.studentEdit)
route.post('/studentUpdate/:id',checkAuth,upload.single("image"),StudentController.studentUpdate)
//
route.post('/student/status/:id', checkAuth, StudentController.toggleStatus);














//update info student
route.get('/uddateinfoStudent/',checkAuth,StudentController.uddateinfoStudent)
route.post('/studentUpdateInfo/:id', uploadResume.single('resume'),StudentController.studentUpdateinfo)
route.get('/student/my-applications/',checkAuth,StudentController.myApplications)













//hod Controller
route.get('/hod/display',checkAuth,HodController.display)
route.post('/inserthod',checkAuth,upload.single("image"),HodController.insertHod)
route.get('/hodDelete/:id',checkAuth,HodController.hodDelete)
route.get("/hod/hodEdit/:id",checkAuth,HodController.hodEdit);

route.post("/hod/update/:id",checkAuth, upload.single("image"), HodController.hodUpdate);
route.get("/placementDrive",checkAuth, HodController.departmentWiseApplications);














//compnay controller
route.get('/company/display',checkAuth,CompnayController.display)
route.post('/compnayInsert',checkAuth,upload.single("image"),CompnayController.compnayInsert)
route.post("/company/update/:id", upload.single("image"), CompnayController.companyUpdate);
route.get("/company/delete/:id", CompnayController.companyDelete);
route.get("/company/edit/:id", CompnayController.companyEdit);
route.get('/applications', checkAuth, CompnayController.companyViewApplications);
route.post('/company/update-status/:id', checkAuth, CompnayController.updateApplicationStatus);






///company Openings/display job
route.get('/company/jobs',checkAuth,JobControlelr.AllJobs)
route.post('/company/jobs/add',checkAuth,JobControlelr.AddJob)
route.post('/company/jobs/Update/:id',checkAuth,JobControlelr.updateJob)
route.post('/compnay/job/delete/:id', JobControlelr.deleteJob);



//Student ke liye job list
route.get('/student/jobs',checkAuth,JobControlelr.showJobsForStudent);
route.post("/student/apply/:jobId", JobControlelr.applyJob);
route.get('/SelectedStudent/display',checkAuth,JobControlelr.SelectedStudent)



//AttendanceController
route.get("/hod/attendance", checkAuth, AttendanceController.viewAttendanceList);
route.get("/hod/attendance/new", checkAuth, AttendanceController.addForm);
route.post("/hod/attendance", checkAuth, AttendanceController.insertAttendance);
route.get("/hod/attendance/edit/:id", checkAuth, AttendanceController.editAttendanceForm);
route.post("/hod/attendance/update/:id", checkAuth, AttendanceController.updateAttendance);
route.get("/hod/attendance/delete/:id", checkAuth, AttendanceController.deleteAttendance);
route.get('/hod/attendance/report', checkAuth, AttendanceController.attendanceReport);
route.get('/hod/attendance/export/pdf', checkAuth, AttendanceController.exportPDF);
route.get('/hod/attendance/report/export/excel', checkAuth, AttendanceController.exportExcel);
route.get("/hod/attendance/monthly-summary",checkAuth, AttendanceController.monthlySummary);

//student ko so
route.get("/student/my-attendance", checkAuth, AttendanceController.myAttendance);

















module.exports =route