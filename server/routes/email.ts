import { Request, Response } from "express";
import { sendEmail, emailTemplates } from "../lib/email";

export interface NotifyPermitSubmissionRequest {
  requesterName: string;
  requesterEmail: string;
  permitType: "work" | "ht" | "gas";
  permitId: string;
  approvers?: string[];
  safetyOfficers?: string[];
  permitDetails: Record<string, unknown>;
}

export const handleNotifyPermitSubmission = async (
  req: Request<unknown, unknown, NotifyPermitSubmissionRequest>,
  res: Response,
) => {
  try {
    const {
      requesterName,
      requesterEmail,
      permitType,
      permitId,
      approvers = [],
      safetyOfficers = [],
      permitDetails,
    } = req.body;

    // Validate required fields
    if (!requesterName || !requesterEmail || !permitType || !permitId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Combine all recipients
    const recipients = [...new Set([...approvers, ...safetyOfficers])];

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No recipients specified (approvers or safety officers)",
      });
    }

    // Generate email content
    const emailContent = emailTemplates.newPermitRequest({
      requesterName,
      requesterEmail,
      permitType: permitType.charAt(0).toUpperCase() + permitType.slice(1),
      permitId,
      permitDetails,
      recipients,
    });

    // Send emails to each recipient
    const emailPromises = recipients.map((email) =>
      sendEmail({
        to: email,
        ...emailContent,
      }),
    );

    const results = await Promise.allSettled(emailPromises);

    // Count successful sends
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    if (failureCount > 0) {
      console.error(
        `Failed to send ${failureCount} emails, ${successCount} succeeded`,
      );
    }

    res.json({
      success: true,
      message: `Email notification sent to ${successCount}/${recipients.length} recipients`,
      sentTo: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("Error in handleNotifyPermitSubmission:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export interface NotifyCommentRequest {
  senderName: string;
  senderRole: "requester" | "approver" | "safety";
  permitType: "work" | "ht" | "gas";
  permitId: string;
  comment: string;
  recipients?: string[];
}

export const handleNotifyComment = async (
  req: Request<unknown, unknown, NotifyCommentRequest>,
  res: Response,
) => {
  try {
    const {
      senderName,
      senderRole,
      permitType,
      permitId,
      comment,
      recipients = [],
    } = req.body;

    // Validate required fields
    if (!senderName || !senderRole || !permitType || !permitId || !comment) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No recipients specified",
      });
    }

    // Generate email content
    const emailContent = emailTemplates.commentNotification({
      senderName,
      senderRole,
      permitId,
      permitType: permitType.charAt(0).toUpperCase() + permitType.slice(1),
      comment,
      recipients,
    });

    // Send emails to each recipient
    const emailPromises = recipients.map((email) =>
      sendEmail({
        to: email,
        ...emailContent,
      }),
    );

    const results = await Promise.allSettled(emailPromises);

    // Count successful sends
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    res.json({
      success: true,
      message: `Comment notification sent to ${successCount}/${recipients.length} recipients`,
      sentTo: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("Error in handleNotifyComment:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export interface NotifyApprovalRequest {
  approverName: string;
  permitType: "work" | "ht" | "gas";
  permitId: string;
  status: "approved" | "rejected" | "pending";
  comment?: string;
  recipients?: string[];
}

export const handleNotifyApproval = async (
  req: Request<unknown, unknown, NotifyApprovalRequest>,
  res: Response,
) => {
  try {
    const {
      approverName,
      permitType,
      permitId,
      status,
      comment,
      recipients = [],
    } = req.body;

    // Validate required fields
    if (!approverName || !permitType || !permitId || !status) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No recipients specified",
      });
    }

    // Generate email content
    const emailContent = emailTemplates.approvalNotification({
      approverName,
      permitId,
      permitType: permitType.charAt(0).toUpperCase() + permitType.slice(1),
      status,
      comment,
      recipients,
    });

    // Send emails to each recipient
    const emailPromises = recipients.map((email) =>
      sendEmail({
        to: email,
        ...emailContent,
      }),
    );

    const results = await Promise.allSettled(emailPromises);

    // Count successful sends
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    res.json({
      success: true,
      message: `Approval notification sent to ${successCount}/${recipients.length} recipients`,
      sentTo: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("Error in handleNotifyApproval:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
