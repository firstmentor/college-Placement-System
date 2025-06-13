const JobModel = require("../models/job");
const sendEmail = require('../utils/sendMail');
const StudentModel = require('../models/student');
const CompanyModel = require('../models/compnay');
const ApplicationModel = require('../models/ApplicationModel')




class JobControlelr {
  static AllJobs = async (req, res) => {
    try {
      const jobs = await JobModel.find({ companyId: req.user.id })
        .populate("companyId", "name") // 👈 ये जरूरी है
        .sort({ createdAt: -1 });

      res.render("job/AllJobs", { jobs, success: req.flash("success") });
    } catch (error) {
      console.log(error);
    }
  };

  static AddJob = async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        salary,
        department,
        jobType,
        applicationDeadline,
        min10Percent,
        min12Percent,
        minCGPA,
        maxBacklogs,
        allowedBranches,
        skillsRequired
      } = req.body;
  
      // ✅ Find company name from logged-in user
      const companyData = await CompanyModel.findById(req.user.id);
      const companyName = companyData?.name || "A Company"; // fallback
  
      // ✅ Save job
      const newJob = new JobModel({
        title,
        description,
        location,
        salary,
        department,
        jobType,
        applicationDeadline,
        companyId: req.user.id,
        requirements: {
          min10Percent,
          min12Percent,
          minCGPA,
          maxBacklogs,
          allowedBranches: allowedBranches?.split(',').map(b => b.trim()),
          skillsRequired: skillsRequired?.split(',').map(s => s.trim())
        }
      });
  
      await newJob.save();
  
      // ✅ Get all students
      const students = await StudentModel.find({}, "email name");
  
      // ✅ Prepare and send emails
      const emailPromises = students.map(student => {
        const html = `
          <p>Dear ${student.name},</p>
          <p>A new job opportunity has been posted by <strong>${companyName}</strong> on Jiwaji University Training & Placement Cell:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Salary:</strong> ${salary}</li>
            <li><strong>Deadline:</strong> ${applicationDeadline}</li>
          </ul>
         
          <p>Thanks,<br>Jiwaji University <br>Training & Placement Cell</p>
        `;
  
        return sendEmail(student.email, `New Job by ${companyName}: ${title}`, html);
      });
  
      await Promise.all(emailPromises);
  
      req.flash("success", "Job posted and notifications sent to students.");
      res.redirect('/company/jobs');
    } catch (error) {
      console.log(error);
      req.flash("error", "Job post failed.");
      res.redirect('/company/jobs');
    }
  };

  static updateJob = async (req, res) => {
    console.log(req.body)
    try {
      const {
        title,
        description,
        salary,
        location,
        department,
        min12Percent,
        minCGPA,
        maxBacklogs,
        skillsRequired,
        allowedBranches,
      } = req.body;

      const updateData = {
        title,
        description,
        salary,
        location,
        department,
        requirements: {
          min12Percent: Number(min12Percent),
          minCGPA: Number(minCGPA),
          maxBacklogs: Number(maxBacklogs),
          skillsRequired: skillsRequired
            ? skillsRequired.split(",").map((skill) => skill.trim())
            : [],
          allowedBranches: allowedBranches
            ? allowedBranches.split(",").map((branch) => branch.trim())
            : [],
        },
      };

      await JobModel.findByIdAndUpdate(req.params.id, updateData);
      req.flash("success", "Job Update successfully");
      res.redirect("/company/jobs"); // Redirect to jobs list page
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  };

  static deleteJob = async (req, res) => {
    try {
      const jobId = req.params.id;
  
      // Optionally: Check if this job belongs to logged-in company
      const job = await JobModel.findOne({ _id: jobId, companyId: req.user.id });
      if (!job) {
        req.flash("error", "Job not found or unauthorized");
        return res.redirect('/company/jobs');
      }
  
      await JobModel.findByIdAndDelete(jobId);
  
      req.flash("success", "Job deleted successfully");
      res.redirect('/company/jobs');
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong");
      res.redirect('/company/jobs');
    }
  };
  


  // Student ke liye saari available jobs dikhana
  static showJobsForStudent = async (req, res) => {
    try {
      const jobs = await JobModel.find({ status: 'open' })
        .populate('companyId', 'name')
        .sort({ createdAt: -1 });
  
      const student = await StudentModel.findById(req.user.id);
  
      res.render('students/jobsList', {
        jobs,
        studentId: req.user.id,
        student,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  
  // Student job apply karega
  static applyJob = async (req, res) => {
    try {
      const student = await StudentModel.findById(req.user.id);
  
      // Check if profile is complete
      if (
        !student.Xyear ||
        !student.Xmarks ||
       
        !student.XIIyear ||
        !student.XIImarks||
        !student.GraYear ||
        !student.GraCGPA ||
        !student.resume
       

        
      ) {
        req.flash('error', 'Please complete your profile and upload resume before applying.');
        return res.redirect('/uddateinfoStudent');
      }
  
      // Check if already applied (optional)
      const alreadyApplied = await ApplicationModel.findOne({
        jobId: req.params.jobId,
        studentId: req.user.id
      });
  
      if (alreadyApplied) {
        req.flash('error', 'You have already applied to this job.');
        return res.redirect('/student/jobs');
      }
  
      // Save application
      const application = new ApplicationModel({
        jobId: req.params.jobId,
        studentId: req.user.id,
        status: 'Applied',
      });
  
      await application.save();
  
      req.flash('success', 'Applied successfully!');
      res.redirect('/student/my-applications');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Something went wrong');
      res.redirect('/student/jobs');
    }
  };

 


  static SelectedStudent = async (req, res) => {
    try {
      res.render("job/SelectedStudent"); //folder(student) display.ejs
    } catch (error) {
      console.log(error);
    }
  };

  
  
}
module.exports = JobControlelr;
