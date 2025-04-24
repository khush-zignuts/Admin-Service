require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { EmailQueue } = require("../models/index");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to read and compile the handlebars template
const compileTemplate = (templatePath, templateData) => {
  const source = fs.readFileSync(path.join(__dirname, templatePath), "utf-8");
  const template = handlebars.compile(source);
  return template(templateData);
};

const sendEmail = async (to, subject, templatePath, templateData) => {
  try {
    // Compile the Handlebars template with data
    const htmlBody = compileTemplate(templatePath, templateData);

    // Save email to EmailQueue
    await EmailQueue.create({
      to: to,
      subject: subject,
      body: htmlBody,
    });

    // Prepare the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody,
    };

    // Send the email
    return await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

module.exports = sendEmail;
