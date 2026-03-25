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
  replyTo?: string;
  fromName?: string;
}

export async function sendEmail({ to, subject, htmlBody, textBody, replyTo, fromName }: EmailOptions) {
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
        From: fromName ? `"${fromName}" <${FROM_EMAIL}>` : FROM_EMAIL,
        To: to,
        ReplyTo: replyTo,
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
 * Helper to wrap content in JKUAT Branding
 */
const wrapBranding = (title: string, content: string) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div style="background-color: #0B3D91; padding: 30px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">JKUAT FindMyID</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px; font-weight: 500;">Customer Service Center</p>
  </div>
  <div style="padding: 40px 30px;">
    <h2 style="color: #0B3D91; margin-top: 0; font-size: 20px; font-weight: 700;">${title}</h2>
    ${content}
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f3f4f6;">
      <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">
        Regards,<br/>
        <strong>JKUAT Customer Service Center</strong><br/>
        Main Campus, Juja
      </p>
    </div>
  </div>
  <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
    © ${new Date().getFullYear()} Jomo Kenyatta University of Agriculture and Technology
  </div>
</div>
`;

/**
 * Predefined email templates
 */
export const emailTemplates = {
  claimSubmittedAdmin: (adminName: string, claimantName: string, itemName: string) => ({
    subject: `New ID Claim Submitted - ${itemName}`,
    html: wrapBranding('New Claim for Verification', `
      <p>Hello ${adminName},</p>
      <p>A new claim has been submitted on <strong>FindMyID</strong> for an identification document belonging to <strong>${claimantName}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Document Details</p>
        <p style="margin: 5px 0 0 0; font-size: 16px; color: #0f172a; font-weight: 600;">${itemName}</p>
      </div>
      <p>Please log in to the admin panel to review the proof provided and either approve or reject the claim.</p>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/claims" style="background-color: #0B3D91; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Review Claim Now</a>
      </div>
    `),
  }),
  claimSubmittedUser: (userName: string, itemName: string) => ({
    subject: `Acknowledgment: Your Claim for ${itemName} is Under Review`,
    html: wrapBranding('Claim Received Successfully', `
      <p>Hello ${userName},</p>
      <p>Thank you for reaching out to the JKUAT Customer Service Center. We have successfully received your ownership claim for <strong>${itemName}</strong>.</p>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="margin: 0; font-weight: 700; color: #1d4ed8;">Status: Administrative Review</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af;">Our team is currently verifying the identification details and the proof of ownership you provided.</p>
      </div>
      <p>Once the review is complete, you will receive another email with instructions on where and how to pick up your document.</p>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/claims" style="background-color: #0B3D91; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Track Progress</a>
      </div>
    `),
  }),
  foundReportSubmittedAdmin: (adminName: string, idName: string, finderContact: string) => ({
    subject: `Action Required: New Found ID for Approval - ${idName}`,
    html: wrapBranding('New ID Verification Required', `
      <p>Hello ${adminName},</p>
      <p>A new identification document has been submitted by a member of the public and requires verification before being listed.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase;">Submission Details</p>
        <p style="margin: 8px 0;"><strong>Document:</strong> ${idName}</p>
        <p style="margin: 8px 0;"><strong>Finder Contact:</strong> ${finderContact}</p>
      </div>
      <p>Please review the uploaded evidence. Once verified, approve it to make it searchable by the owner.</p>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/found-reports" style="background-color: #0B3D91; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Approve Submission</a>
      </div>
    `),
  }),
  foundReportSubmittedUser: (userName: string, idName: string) => ({
    subject: `Submission Received: Thank you for finding ${idName}`,
    html: wrapBranding('Thank You for Your Honesty', `
      <p>Hello ${userName || 'there'},</p>
      <p>Thank you for reporting found property (<strong>${idName}</strong>) to the JKUAT Customer Service Center. Your integrity helps other students recover their essential documents.</p>
      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 12px 12px 0;">
         <p style="margin: 0; color: #065f46; font-weight: 700;">Status: System Verification</p>
         <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">Our administration team is currently verifying the document details. Once approved, it will be listed for the owner to find.</p>
      </div>
      <p>Please keep the document safe. We will contact you if the owner initiates a claim or if we need further information.</p>
    `),
  }),
  claimStatusUpdate: (userName: string, itemName: string, status: string, notes?: string) => ({
    subject: `Update on your ID Claim - ${itemName}`,
    html: wrapBranding('Your Claim Status has been Updated', `
      <p>Hello ${userName},</p>
      <p>There is an update regarding your claim for <strong>${itemName}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Current Status</p>
        <p style="margin: 10px 0 0 0; font-size: 20px; text-transform: capitalize; color: ${status === 'approved' ? '#059669' : status === 'rejected' ? '#dc2626' : '#0B3D91'}; font-weight: 800;">${status}</p>
      </div>
      ${notes ? `<div style="background-color: #fffbeb; padding: 20px; border-radius: 12px; border: 1px solid #fef3c7; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Instruction from Admin:</strong> ${notes}</p></div>` : ''}
      <p>For detailed next steps or pickup instructions, please log in to your student dashboard.</p>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/claims" style="background-color: #0B3D91; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View Next Steps</a>
      </div>
    `),
  }),
  lostReportSubmitted: (userName: string, idName: string) => ({
    subject: `Acknowledgment: We've Received Your Lost ID Report - ${idName}`,
    html: wrapBranding('Lost ID Report Confirmed', `
      <p>Hello ${userName},</p>
      <p>We confirm receipt of your report for a lost document (<strong>${idName}</strong>). Our system is now actively monitoring for any matches.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
        <p style="margin: 0; color: #0B3D91; font-weight: 700;">STATUS: ACTIVE MONITORING</p>
      </div>
      <p>We will notify you immediately by email and SMS once a matching document is found or surrendered to our office.</p>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/requests" style="background-color: #0B3D91; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Monitor Status</a>
      </div>
    `),
  }),
  lostReportAdmin: (adminName: string, userEmail: string, idDetails: string) => ({
    subject: `Action Required: New Lost ID Entry - ${idDetails}`,
    html: wrapBranding('New Lost ID Notification', `
      <p>Hello Admin,</p>
      <p>A new <strong>Lost ID Report</strong> has been filed. Review the details below to assist in manual matching if necessary.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase;">Submission Details</p>
        <p style="margin: 8px 0;"><strong>Document:</strong> ${idDetails}</p>
        <p style="margin: 8px 0;"><strong>User Email:</strong> ${userEmail}</p>
      </div>
      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests" style="background-color: #0B3D91; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open Requests Panel</a>
      </div>
    `),
  }),
  lostReportUpdate: (userName: string, idName: string, status: string, notes?: string) => ({
    subject: `Update on your Lost ID Report - ${idName}`,
    html: wrapBranding('Update on Your Lost Property', `
      <p>Hello ${userName},</p>
      <p>There is a new update regarding your lost ID report for <strong>${idName}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">New Status</p>
        <p style="margin: 10px 0 0 0; font-size: 20px; text-transform: capitalize; color: ${status === 'matched' ? '#059669' : '#0B3D91'}; font-weight: 800;">${status.replace('_', ' ')}</p>
      </div>
      ${status === 'matched' ? 
        `<div style="background-color: #ecfdf5; padding: 20px; border-radius: 12px; border: 1px solid #10b981; margin: 20px 0;">
           <p style="margin: 0; font-weight: 700; color: #065f46;">Great news! A match has been found.</p>
           <p style="margin: 5px 0 0 0; font-size: 14px; color: #047857;">Please check your dashboard for pickup instructions and location at the Customer Service Center.</p>
         </div>` : ''
      }
      ${notes ? `<div style="background-color: #fffbeb; padding: 20px; border-radius: 12px; border: 1px solid #fef3c7; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Administrative Note:</strong> ${notes}</p></div>` : ''}
    `),
  }),
  customNotification: (userName: string, message: string) => ({
    subject: `Communication from JKUAT Customer Service Center`,
    html: wrapBranding('Important Information Regarding Your Documents', `
      <p>Hello ${userName},</p>
      <p>${message}</p>
    `),
  }),
};
