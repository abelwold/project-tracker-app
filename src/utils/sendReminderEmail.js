




import emailjs from "@emailjs/browser";

export const sendReminderEmail = async (to_email, task_title, due_date) => {
  try {
    const response = await emailjs.send(
      "service_3aqgmja",     // Replace with your actual ID
      "template_2enellm",    // Replace with your actual template
      {
        to_email,
        task_title,
        due_date,
      },
      "-8UEPi65_xh92r1MS"      // EmailJS public key
    );

    console.log("Email sent successfully:", response.status);
  } catch (error) {
    console.error("Email send failed:", error);
  }
};
