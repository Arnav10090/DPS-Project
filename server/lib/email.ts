import nodemailer from "nodemailer";

// Email transporter configuration
// You can configure this with your email provider (Gmail, SMTP server, SendGrid, etc.)
const createTransporter = () => {
  // Using environment variables for email credentials
  // For development, you can use Gmail with App Passwords
  // For production, use SendGrid, Mailgun, or your own SMTP server
  
  const emailConfig = {
    // Example: Gmail SMTP
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
  };

  return nodemailer.createTransport(emailConfig);
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();

    // Verify credentials if in development
    if (process.env.NODE_ENV !== "production") {
      try {
        await transporter.verify();
        console.log("Email transporter verified");
      } catch (error) {
        console.error("Email transporter verification failed:", error);
      }
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@dps.local",
      ...options,
    });

    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  newPermitRequest: (data: {
    requesterName: string;
    requesterEmail: string;
    permitType: string;
    permitId: string;
    permitDetails: Record<string, unknown>;
    recipients: string[];
  }) => {
    const recipientList = Array.isArray(data.recipients)
      ? data.recipients.join(", ")
      : data.recipients;

    return {
      subject: `New ${data.permitType} Permit Request - ${data.permitId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New ${data.permitType} Permit Request</h2>
          <p>Hello,</p>
          <p>A new ${data.permitType} permit request has been submitted for your review.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Permit Details</h3>
            <p><strong>Permit ID:</strong> ${data.permitId}</p>
            <p><strong>Requested by:</strong> ${data.requesterName} (${data.requesterEmail})</p>
            <p><strong>Permit Type:</strong> ${data.permitType}</p>
            <p><strong>Recipients:</strong> ${recipientList}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
            <h4>Request Summary:</h4>
            <pre style="background-color: white; padding: 10px; overflow-x: auto;">
${JSON.stringify(data.permitDetails, null, 2)}
            </pre>
          </div>
          
          <p>Please log in to the Digital Permit System to review and take action on this request.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This is an automated email from the Digital Permit System (DPS). Please do not reply to this email.
          </p>
        </div>
      `,
    };
  },

  commentNotification: (data: {
    senderName: string;
    senderRole: string;
    permitId: string;
    permitType: string;
    comment: string;
    recipients: string[];
  }) => {
    return {
      subject: `New Comment on ${data.permitType} Permit ${data.permitId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Comment on Permit Request</h2>
          <p>Hello,</p>
          <p>A new comment has been added by a ${data.senderRole} on the ${data.permitType} permit request.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Comment Details</h3>
            <p><strong>Permit ID:</strong> ${data.permitId}</p>
            <p><strong>Permit Type:</strong> ${data.permitType}</p>
            <p><strong>From ${data.senderRole}:</strong> ${data.senderName}</p>
            <p><strong>Recipients:</strong> ${Array.isArray(data.recipients) ? data.recipients.join(", ") : data.recipients}</p>
          </div>
          
          <div style="background-color: #fff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h4>Comment:</h4>
            <p>${data.comment.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p>Please log in to the Digital Permit System to view the full context and respond if needed.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This is an automated email from the Digital Permit System (DPS). Please do not reply to this email.
          </p>
        </div>
      `,
    };
  },

  approvalNotification: (data: {
    approverName: string;
    permitId: string;
    permitType: string;
    status: "approved" | "rejected" | "pending";
    comment?: string;
    recipients: string[];
  }) => {
    const statusColor =
      data.status === "approved"
        ? "#10b981"
        : data.status === "rejected"
          ? "#ef4444"
          : "#f59e0b";
    const statusText =
      data.status === "approved"
        ? "Approved"
        : data.status === "rejected"
          ? "Rejected"
          : "Pending Review";

    return {
      subject: `Permit ${statusText}: ${data.permitType} - ${data.permitId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Permit Status Update</h2>
          <p>Hello,</p>
          <p>Your permit request has been reviewed and updated.</p>
          
          <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0;">Status: ${statusText}</h3>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Update Details</h3>
            <p><strong>Permit ID:</strong> ${data.permitId}</p>
            <p><strong>Permit Type:</strong> ${data.permitType}</p>
            <p><strong>Reviewed by (${data.approverName}):</strong></p>
            ${data.comment ? `<p><strong>Comment:</strong> ${data.comment.replace(/\n/g, "<br>")}</p>` : ""}
          </div>
          
          <p>Please log in to the Digital Permit System to view the complete details.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This is an automated email from the Digital Permit System (DPS). Please do not reply to this email.
          </p>
        </div>
      `,
    };
  },
};
