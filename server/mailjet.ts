import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC || "",
  process.env.MJ_APIKEY_PRIVATE || ""
);

interface SendEmailOptions {
  toEmail: string;
  toName: string;
  subject: string;
  textPart: string;
  htmlPart: string;
}

export async function sendEmail({ toEmail, toName, subject, textPart, htmlPart }: SendEmailOptions) {
  const senderEmail = process.env.MJ_SENDER_EMAIL || "noreply@salaamcup.com";
  const senderName = process.env.MJ_SENDER_NAME || "Salaam Cup";

  const result = await mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName,
          },
          To: [
            {
              Email: toEmail,
              Name: toName,
            },
          ],
          Subject: subject,
          TextPart: textPart,
          HTMLPart: htmlPart,
        },
      ],
    });

  return result.body;
}

export async function sendCaptainActivationEmail(
  captainEmail: string,
  captainName: string,
  teamName: string,
  activationUrl: string
) {
  const subject = `Activate Your Salaam Cup Captain Account - ${teamName}`;

  const textPart = `Hi ${captainName},

Congratulations! Your team "${teamName}" has been approved for Salaam Cup.

To get started, please activate your captain account by clicking the link below and setting your password:

${activationUrl}

This link will expire in 30 minutes and can only be used once.

If you did not expect this email, you can safely ignore it.

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
    
    <p style="font-size: 16px;">To get started, please activate your captain account by clicking the button below and setting your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${activationUrl}" style="background-color: #111; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Activate My Account</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">This link will expire in 30 minutes and can only be used once.</p>
    <p style="font-size: 14px; color: #666;">If you did not expect this email, you can safely ignore it.</p>
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

