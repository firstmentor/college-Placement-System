const nodemailer = require('nodemailer');

const sendMail = async (to, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Jiwaji University Gwalior" <${process.env.MAIL_EMAIL}>`,
      to,
      subject,
      text: message,
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
};

module.exports = sendMail;
