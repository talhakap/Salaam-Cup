import { Resend } from "resend";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email,
  };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}

export async function sendCaptainCredentialsEmail(
  toEmail: string,
  captainName: string,
  teamName: string,
  password: string,
  loginUrl: string
) {
  const { client, fromEmail } = await getResendClient();

  const result = await client.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `Salaam Cup - Your Team "${teamName}" Has Been Approved!`,
    html: `
      <div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 30px 0; background-color: #000; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; font-family: 'Montserrat', Arial, sans-serif; font-size: 28px; margin: 0;">
            SALAAM CUP
          </h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; font-family: 'Montserrat', Arial, sans-serif; margin-top: 0;">
            Congratulations, ${captainName}!
          </h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your team <strong>${teamName}</strong> has been approved for the Salaam Cup tournament. 
            You can now log in to the Captain Dashboard to manage your roster, view schedules, and more.
          </p>
          
          <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #333; font-family: 'Montserrat', Arial, sans-serif; margin-top: 0; font-size: 16px;">
              Your Login Credentials
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 14px; width: 80px;">Email:</td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: bold;">${toEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 14px;">Password:</td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: bold;">${password}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-family: 'Montserrat', Arial, sans-serif; font-weight: bold; font-size: 14px;">
              LOG IN TO CAPTAIN DASHBOARD
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            For security, we recommend changing your password after your first login. 
            If you have any questions, please contact the Salaam Cup organizers.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0;">Salaam Cup - Toronto & GTA Muslim Community Sports</p>
        </div>
      </div>
    `,
  });

  return result;
}
