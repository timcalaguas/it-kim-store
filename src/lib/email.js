import nodemailerConfig from "../../nodemailer.config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(nodemailerConfig);

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: nodemailerConfig.auth.user,
    to: to,
    subject: subject,
    text: text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

export default sendEmail;
