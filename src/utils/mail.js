const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
const sendEmail = async (recipientEmail, subject, text, html) => {
  try {
      const mailOptions = {
          from: process.env.MAIL_USER,
          to: recipientEmail, 
          subject: subject,
          text: text, 
          html: html
      };

      // Gửi email
      await transporter.sendMail(mailOptions);
      console.log('Email đã được gửi thành công!');
  } catch (error) {
      console.error('Có lỗi khi gửi email:', error);
      throw new Error('Không thể gửi email');
  }
};
  const sendMail = async (mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw AppError.from(error, 500);
    }
  };

module.exports = {
  transporter,
  sendEmail,
  sendMail
};
