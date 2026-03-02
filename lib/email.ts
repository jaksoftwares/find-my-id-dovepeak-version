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
    subject: `URGENT: New Public Found ID for Approval - ${idName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #8b5cf6; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0;">New Verification Required</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello ${adminName},</p>
          <p>A new identification document has been submitted by a member of the public. This report is currently <strong>Pending Approval</strong> and is not yet visible to other users.</p>
          
          <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; border-bottom: 1px solid #ddd6fe; padding-bottom: 10px;"><strong>SUBMISSION DETAILS</strong></p>
            <p style="margin: 5px 0;"><strong>ID Detail:</strong> ${idName}</p>
            <p style="margin: 5px 0;"><strong>Finder Contact:</strong> ${finderContact}</p>
          </div>
          
          <p>Please review the uploaded image and contact details. Once verified, approve it to make it searchable by the owner.</p>
          
          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/found-reports" style="background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review & Approve Now</a>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          JKUATfindmyid System Notification
        </div>
      </div>
    `,
  }),
  foundReportSubmittedUser: (userName: string, idName: string) => ({
    subject: `Submission Received: Thank you for finding ${idName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0;">Submission Successful!</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello ${userName || 'there'},</p>
          <p>Thank you for your honesty and for taking the time to report finding <strong>${idName}</strong>. You are making our community a safer and better place.</p>
          
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
             <p style="margin: 0; color: #065f46; font-weight: 600;">Status: Pending System Review</p>
             <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">Our administration team is currently verifying the document details. Once approved, it will be listed so the owner can find it.</p>
          </div>
          
          <p><strong>What should you do now?</strong></p>
          <p>Please keep the document safe until further instructions. If the owner reaches out through the system or if we need more info, we will contact you via the details you provided.</p>
          
          <p style="margin-top: 30px;">Warm regards,<br/><strong>The JKUATfindmyid Team</strong></p>
        </div>
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
    subject: `Acknowledgment: We've Received Your Lost ID Report - ${idName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #374151; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0;">Report Filed Successfully</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello ${userName},</p>
          <p>This is to confirm that we have received your lost identification report for <strong>${idName}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="margin: 0; color: #4f46e5; font-weight: 700;">STATUS: RECEIVED & MONITORING</p>
          </div>
          
          <p><strong>What Happens Next?</strong></p>
          <p>Our system is now actively monitoring for any document that matches your description. <strong>We will notify you immediately by email and SMS once a match is found</strong> or if your report requires further verification.</p>
          
          <p>In the meantime, you can track the status of your report on your dashboard.</p>
          
          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/requests" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Check Real-time Status</a>
          </div>
          
          <p style="margin-top: 40px; font-size: 14px; color: #6b7280; text-align: center;">
            Thank you for using JKUATfindmyid. We hope you recover your document soon.<br/>
            <strong>The JKUATfindmyid Team</strong>
          </p>
        </div>
      </div>
    `,
  }),
  lostReportAdmin: (adminName: string, userEmail: string, idDetails: string) => ({
    subject: `ACTION REQUIRED: New Lost ID Submission - ${idDetails}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1e293b; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0;">New Lost ID Entry</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello Admin,</p>
          <p>A new <strong>Lost ID Report</strong> has been submitted. Please review the details below to ensure data accuracy and facilitate matching.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; font-weight: 600;">SUBMISSION DETAILS</p>
            <p style="margin: 5px 0;"><strong>Document:</strong> ${idDetails}</p>
            <p style="margin: 5px 0;"><strong>Reported By:</strong> ${userEmail}</p>
          </div>
          
          <p>Please log in to the admin panel to manage this request and oversee any potential auto-matches generated by the system.</p>
          
          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Admin Panel</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          Automated System Notification | JKUATfindmyid
        </div>
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
