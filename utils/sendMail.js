const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or "hotmail", etc.
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PNINFOSYS JOB ALERT" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
