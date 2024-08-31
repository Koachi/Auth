const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async options => {
    //CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    //DEFINE EMAIL OPTIONS
    const mailOptions = {
        from: 'Support <youremail@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
      };
    
      await transporter.sendMail(mailOptions);
    };

module.exports = sendEmail;