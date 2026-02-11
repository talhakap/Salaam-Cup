import Mailgun from "mailgun.js";
import FormData from "form-data";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const DOMAIN = process.env.MAILGUN_DOMAIN || "";

interface SendEmailOptions {
  toEmail: string;
  toName: string;
  subject: string;
  textPart: string;
  htmlPart: string;
}

export async function sendEmail({ toEmail, toName, subject, textPart, htmlPart }: SendEmailOptions) {
  const senderEmail = process.env.MAILGUN_SENDER_EMAIL || `postmaster@${DOMAIN}`;
  const senderName = "Salaam Cup";

  const result = await mg.messages.create(DOMAIN, {
    from: `${senderName} <${senderEmail}>`,
    to: [`${toName} <${toEmail}>`],
    subject,
    text: textPart,
    html: htmlPart,
  });

  return result;
}

export async function sendCaptainCredentialsEmail(
  captainEmail: string,
  captainName: string,
  teamName: string,
  password: string,
  loginUrl: string
) {
  const subject = `Your Salaam Cup Captain Account - ${teamName}`;

  const textPart = `Hi ${captainName},

Congratulations! Your team "${teamName}" has been approved for Salaam Cup.

A captain account has been created for you. Use the credentials below to log in and manage your team:

Email: ${captainEmail}
Password: ${password}
Login: ${loginUrl}

Please change your password after your first login.

Thank you,
Salaam Cup Team`;

  const htmlPart = `
<div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #111;">
    <h1 style="font-family: 'Montserrat', Arial, sans-serif; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase;">Salaam Cup</h1>
  </div>
  
  <div style="padding: 30px 0;">
    <p style="font-size: 16px;">Hi <strong>${captainName}</strong>,</p>
    
    <p style="font-size: 16px;">Congratulations! Your team <strong>"${teamName}"</strong> has been approved for Salaam Cup.</p>
    
    <p style="font-size: 16px;">A captain account has been created for you. Use the credentials below to log in and manage your team:</p>
    
    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 5px 0; font-size: 15px;"><strong>Email:</strong> ${captainEmail}</p>
      <p style="margin: 5px 0; font-size: 15px;"><strong>Password:</strong> ${password}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background-color: #111; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Log In Now</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Please change your password after your first login.</p>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
    <p style="font-size: 13px; color: #999; margin: 0;">Salaam Cup Team</p>
  </div>
</div>`;

  return sendEmail({
    toEmail: captainEmail,
    toName: captainName,
    subject,
    textPart,
    htmlPart,
  });
}
