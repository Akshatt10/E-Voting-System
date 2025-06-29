const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASSWORD
  }
});

// Existing function
const sendCandidateNotification = async (candidateEmail, electionData) => {
  const { id, title, description, startTime, endTime } = electionData;

  const formattedStartTime = new Date(startTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedEndTime = new Date(endTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: '"Election System" <noreply@election.com>',
    to: candidateEmail,
    subject: `🌟 Great News! You've Been Nominated for "${title}"`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #4CAF50; padding: 25px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🗳️ Congratulations! You're a Candidate!</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear Candidate,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">We're thrilled to inform you that you have been officially **nominated** as a candidate for the upcoming election!</p>

          <div style="background: #f0f8ff; padding: 20px; border-left: 5px solid #007bff; border-radius: 5px; margin: 25px 0;">
            <h3 style="color: #007bff; margin-top: 0; font-size: 20px;">Election Details:</h3>
            <p style="font-size: 16px; margin: 5px 0;"><strong>Title:</strong> ${title}</p>
            <p style="font-size: 16px; margin: 5px 0;"><strong>Description:</strong> ${description}</p>
            <p style="font-size: 16px; margin: 5px 0;"><strong>Voting Period:</strong> ${formattedStartTime} to ${formattedEndTime}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">This is an exciting opportunity to make a real impact. We encourage you to review the election details and prepare your campaign.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/election/${id}"
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; transition: background-color 0.3s ease;">
              View Election Details & Get Started →
            </a>
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">We wish you the very best of luck with your campaign!</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Election System. All rights reserved.</p>
          <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

// NEW FUNCTION FOR REMINDER
const sendVotingReminder = async (candidateEmail, candidateName, electionData) => {
  const { id, title, endTime } = electionData;

  const formattedEndTime = new Date(endTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: '"Election System" <noreply@election.com>',
    to: candidateEmail,
    subject: `🔔 Gentle Reminder: Vote in "${title}" Election!`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #ffc107; padding: 25px; text-align: center; color: #333;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Don't Forget to Vote!</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear ${candidateName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">This is a friendly reminder that your vote is still needed for the election: <strong>"${title}"</strong>.</p>

          <div style="background: #fff3cd; padding: 20px; border-left: 5px solid #ffc107; border-radius: 5px; margin: 25px 0;">
            <h3 style="color: #ffc107; margin-top: 0; font-size: 20px;">Election Closes Soon!</h3>
            <p style="font-size: 16px; margin: 5px 0;">The voting period for this election will end on:</p>
            <p style="font-size: 18px; margin: 10px 0; font-weight: bold;">${formattedEndTime}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">Please take a moment to cast your vote. Your participation is vital for the outcome.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/election/${id}"
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; transition: background-color 0.3s ease;">
              Cast Your Vote Now →
            </a>
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">If you have already voted, please disregard this email. Thank you for your participation!</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Election System. All rights reserved.</p>
          <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};


module.exports = { sendCandidateNotification, sendVotingReminder };