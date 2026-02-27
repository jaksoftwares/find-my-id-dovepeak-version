/**
 * Email utility using Postmark API
 */

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";
const FROM_EMAIL = "contact@dovepeakdigital.com";

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export async function sendEmail({ to, subject, htmlBody, textBody }: EmailOptions) {
  const apiToken = process.env.POSTMARK_API_TOKEN;

  if (!apiToken) {
    console.error("POSTMARK_API_TOKEN is not set in environment variables");
    return { success: false, message: "Email configuration missing" };
  }

  try {
    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": apiToken,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
        TextBody: textBody || htmlBody.replace(/<[^>]*>?/gm, ''), // Simple strip tags
        MessageStream: "outbound",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Postmark API error:", data);
      return { success: false, message: data.Message || "Failed to send email" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Internal error sending email" };
  }
}

/**
 * Predefined email templates
 */
export const emailTemplates = {
  claimSubmittedAdmin: (adminName: string, claimantName: string, itemName: string) => ({
    subject: `New ID Claim Submitted: ${itemName}`,
    html: `
      <h2>Hello ${adminName},</h2>
      <p>A new claim has been submitted on JKUATfindmyid.</p>
      <p><strong>Claimant:</strong> ${claimantName}</p>
      <p><strong>Item:</strong> ${itemName}</p>
      <p>Please log in to the admin panel to review the proof and process the claim.</p>
      <br/>
      <p>Regards,<br/>JKUATfindmyid Team</p>
    `,
  }),
  claimStatusUpdate: (userName: string, itemName: string, status: string, notes?: string) => ({
    subject: `Update on your ID Claim: ${itemName}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>Your claim for <strong>${itemName}</strong> has been <strong>${status}</strong>.</p>
      ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
      <p>You can check the details on your dashboard.</p>
      <br/>
      <p>Regards,<br/>JKUATfindmyid Team</p>
    `,
  }),
  customNotification: (userName: string, message: string) => ({
    subject: `Important Update regarding your Claim`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>${message}</p>
      <br/>
      <p>Regards,<br/>JKUATfindmyid Team</p>
    `,
  }),
};
