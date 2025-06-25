const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Fetch from config
const gmailEmail = functions.config().gmail.email;
const gmailPass = functions.config().gmail.pass;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPass,
  },
});

exports.sendTaskReminder = functions.https.onCall(async (data, context) => {
  const { to, subject, message } = data;

  const mailOptions = {
    from: gmailEmail,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Email send failed.");
  }
});
