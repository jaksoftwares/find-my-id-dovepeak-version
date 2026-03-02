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
    subject: `New ID Claim Submitted - ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hello ${adminName},</h2>
        <p>A new claim has been submitted on JKUATfindmyid for an identification document.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 0;"><strong>Claimant:</strong> ${claimantName}</p>
          <p style="margin: 0;"><strong>Document:</strong> ${itemName}</p>
        </div>
        <p><strong>Required Action:</strong></p>
        <p>Please log in to the admin panel to review the proof provided and either approve or reject the claim. Quick turnaround helps users get back their essential documents.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/claims" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Claim</a>
        </div>
        <br/>
        <p>Regards,<br/><strong>JKUATfindmyid Team</strong></p>
      </div>
    `,
  }),
  claimSubmittedUser: (userName: string, itemName: string) => ({
    subject: `Acknowledgment: Your Claim for ${itemName} is Under Review`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #374151; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 25px;">
           <h2 style="color: #4f46e5; margin: 0;">We've Received Your Claim!</h2>
        </div>
        <p>Hello ${userName},</p>
        <p>Thank you for reaching out. We have successfully received your claim request for <strong>${itemName}</strong>.</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0;">
          <p style="margin: 0; font-weight: 600;">Current Status: <span style="color: #1d4ed8;">Being Reviewed by Admin</span></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #4b5563;">Our administration team is currently verifying the identification details and the proof of ownership you provided.</p>
        </div>
        <p><strong>What's the process?</strong></p>
        <p>Once the review is done, you will be notified of the outcome via email and on your dashboard. If approved, you'll receive clear instructions on how and where to collect your document.</p>
        <p>We appreciate your patience during this critical verification step.</p>
        <div style="margin-top: 35px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/claims" style="background-color: #4f46e5; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Track My Claim Progress</a>
        </div>
        <p style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af;">
          Best of luck,<br/>
          <strong>The JKUATfindmyid Team</strong>
        </p>
      </div>
    `,
  }),
  foundReportSubmittedAdmin: (adminName: string, idName: string, finderContact: string) => ({
    subject: `New Public Found ID Submission - ${idName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #8b5cf6;">New Found ID Reported</h2>
        <p>A user has reported finding an identification document that needs to be officially listed.</p>
        <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Document:</strong> ${idName}</p>
          <p style="margin: 5px 0 0 0;"><strong>Finder Contact:</strong> ${finderContact}</p>
        </div>
        <p>Please review the submission, verify the image proof, and approve it to make it visible on the public browsing page.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/found-reports" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Found Report</a>
        </div>
        <br/>
        <p>Regards,<br/>JKUATfindmyid System</p>
      </div>
    `,
  }),
  foundReportSubmittedUser: (userName: string, idName: string) => ({
    subject: `Thank you for reporting a found ID - ${idName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #8b5cf6;">You're a Hero!</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>Thank you for taking the time to report finding <strong>${idName}</strong>. Your honesty helps a fellow student or citizen regain their identity.</p>
        <div style="background-color: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
           <p style="margin: 0;">Our administrators are currently reviewing your report. Once verified, it will be listed on our platform where the owner can find it.</p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <p>Please keep the document safe. If you indicated a holding location, our admins might reach out to confirm it.</p>
        <p>Thank you for making our community better.</p>
        <br/>
        <p>Best Regards,<br/><strong>The JKUATfindmyid Team</strong></p>
      </div>
    `,
  }),
  claimStatusUpdate: (userName: string, itemName: string, status: string, notes?: string) => ({
    subject: `Update on your ID Claim - ${itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hello ${userName},</h2>
        <p>Your claim for <strong>${itemName}</strong> has been updated.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> <span style="text-transform: capitalize; color: ${status === 'approved' ? '#059669' : status === 'rejected' ? '#dc2626' : '#4f46e5'}; font-weight: bold;">${status}</span></p>
        </div>
        ${notes ? `<div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;"><p style="margin: 0;"><strong>Admin Notes:</strong> ${notes}</p></div>` : ''}
        <p>You can view more details and next steps on your dashboard.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/claims" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <br/>
        <p>Best Regards,<br/><strong>The JKUATfindmyid Team</strong></p>
      </div>
    `,
  }),
  lostReportSubmitted: (userName: string, idName: string) => ({
    subject: `Lost ID Report Filed - ${idName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hello ${userName},</h2>
        <p>Your lost identification report for <strong>${idName}</strong> has been successfully filed on JKUATfindmyid.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 25px 0;">
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #4f46e5; font-weight: bold;">Submitted & Reviewing</span></p>
        </div>
        <p>Our team is currently reviewing your report. We will cross-reference it with our database of found documents and notify you immediately once a match is identified or your report is verified.</p>
        <p><strong>What's next?</strong></p>
        <ul>
          <li>We will notify you by email and SMS once your report status changes.</li>
          <li>You can keep your report active by updating any details on your dashboard.</li>
        </ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/requests" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Report Status</a>
        </div>
        <br/>
        <p style="font-size: 14px; color: #666;">If you have already found your ID, please mark the request as 'Resolved' in your dashboard to help us prioritize other users.</p>
        <p>Regards,<br/><strong>The JKUATfindmyid Team</strong></p>
      </div>
    `,
  }),
  lostReportAdmin: (adminName: string, userName: string, idName: string) => ({
    subject: `New Lost ID Report - ${idName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hello Admin,</h2>
        <p>A new <strong>Lost ID Report</strong> has been submitted by <strong>${userName}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 0;"><strong>Document:</strong> ${idName}</p>
          <p style="margin: 0;"><strong>User email:</strong> ${userName}</p>
        </div>
        <p>Please review the details and initiate matching if not already auto-matched by the system.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Requests</a>
        </div>
        <br/>
        <p>Regards,<br/><strong>JKUATfindmyid System</strong></p>
      </div>
    `,
  }),
  lostReportUpdate: (userName: string, idName: string, status: string, notes?: string) => ({
    subject: `Update on your Lost ID Report - ${idName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hello ${userName},</h2>
        <p>There is an update on your lost ID report for <strong>${idName}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 0;"><strong>New Status:</strong> <span style="text-transform: capitalize; color: ${status === 'matched' ? '#059669' : '#4f46e5'}; font-weight: bold;">${status.replace('_', ' ')}</span></p>
        </div>
        ${notes ? `<div style="background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;"><p style="margin: 0;"><strong>Update Details:</strong> ${notes}</p></div>` : ''}
        ${status === 'matched' ? 
          `<p style="font-weight: bold; color: #059669;">Great news! We have found a matching ID that fits your description.</p>
           <p>Please check your dashboard for pickup instructions and location.</p>` : 
          `<p>Our team is still actively monitoring for your document.</p>`
        }
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/requests" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <br/>
        <p>Best Regards,<br/><strong>The JKUATfindmyid Team</strong></p>
      </div>
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
