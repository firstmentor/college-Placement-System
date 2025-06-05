const JobModel = require("../models/job");

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
      // console.log(req.body)
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
        skillsRequired,
      } = req.body;

      const newJob = new JobModel({
        title,
        description,
        location,
        salary,
        department,
        jobType,
        applicationDeadline,
        companyId: req.user.id, // company user id
        requirements: {
          min10Percent,
          min12Percent,
          minCGPA,
          maxBacklogs,
          allowedBranches: allowedBranches?.split(",").map((b) => b.trim()),
          skillsRequired: skillsRequired?.split(",").map((s) => s.trim()),
          // ये code उस string को array में बदल देता है और spaces साफ करता है ताकि database में clean data जाए।
        },
      });

      await newJob.save();
      res.redirect("/company/jobs"); // redirect to posted jobs page
    } catch (error) {
      console.log(error);
    }
  };

  static updateJob = async (req, res) => {
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
      await JobModel.findByIdAndDelete(jobId);
      // Redirect back to jobs listing page after delete
      req.flash("success", "Job delete successfully");

      res.redirect("/company/jobs");
    } catch (error) {
      console.log(error);
    }
  };


  // Student ke liye saari available jobs dikhana
  static showJobsForStudent = async (req, res) => {
    try {
      // Yahan simple sa filter laga sakte ho, jaise status open
      const jobs = await JobModel.find({ status: 'open' }).populate('companyId', 'name').sort({ createdAt: -1 });
      res.render('students/jobsList', { jobs, studentId: req.user.id,success:req.flash('success'),error:req.flash('error') });
    } catch (error) {
      console.log(error);
     
    }
  };

  // Student job apply karega
  static applyJob = async (req, res) => {
    try {
      const jobId = req.params.id;
      const studentId = req.user.id;
  
      // 1. Find the job
      const job = await JobModel.findById(jobId);
      cosnole.log(job)
      // if (!job) return res.status(404).render('error', { message: 'Job not found' });
  
      // 2. Check if already applied
      const alreadyApplied = job.applicants.some(
        app => app.student.toString() === studentId
      );
      if (alreadyApplied) {
        return res.render("student/jobList", {
          jobs: await JobModel.find().populate("companyId").sort({ createdAt: -1 }),
          user: req.user,
          error: "You have already applied for this job.",
          success: ""
        });
      }
  
      // 3. Apply the job
      job.applicants.push({
        student: studentId,
        status: 'applied',
        appliedDate: new Date()
      });
      await job.save();
  
      return res.render("student/jobList", {
        jobs: await JobModel.find().populate("companyId").sort({ createdAt: -1 }),
        user: req.user,
        success: "Applied successfully!",
        error: ""
      });
    } catch (error) {
      console.log(error);
      return res.status(500).render('error', { message: 'Server Error' });
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
