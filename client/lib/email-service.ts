const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface SendPermitNotificationPayload {
  requesterName: string;
  requesterEmail: string;
  permitType: "work" | "ht" | "gas";
  permitId: string;
  approvers?: string[];
  safetyOfficers?: string[];
  permitDetails: Record<string, unknown>;
}

export interface SendCommentNotificationPayload {
  senderName: string;
  senderRole: "requester" | "approver" | "safety";
  permitType: "work" | "ht" | "gas";
  permitId: string;
  comment: string;
  recipients?: string[];
}

export interface SendApprovalNotificationPayload {
  approverName: string;
  permitType: "work" | "ht" | "gas";
  permitId: string;
  status: "approved" | "rejected" | "pending";
  comment?: string;
  recipients?: string[];
}

/**
 * Send email notification when a permit is submitted
 */
export const sendPermitSubmissionNotification = async (
  payload: SendPermitNotificationPayload
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notify/permit-submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send permit notification: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Permit notification sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending permit notification:", error);
    throw error;
  }
};

/**
 * Send email notification when a comment is added
 */
export const sendCommentNotification = async (
  payload: SendCommentNotificationPayload
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notify/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send comment notification: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Comment notification sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending comment notification:", error);
    throw error;
  }
};

/**
 * Send email notification when a permit is approved/rejected/pending
 */
export const sendApprovalNotification = async (
  payload: SendApprovalNotificationPayload
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notify/approval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send approval notification: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Approval notification sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending approval notification:", error);
    throw error;
  }
};

/**
 * Extract email addresses from user data
 * Handles both string emails and objects with email properties
 */
export const extractEmails = (users: unknown[]): string[] => {
  if (!Array.isArray(users)) return [];

  return users
    .map((user) => {
      if (typeof user === "string") return user;
      if (typeof user === "object" && user !== null) {
        const userObj = user as Record<string, unknown>;
        return (
          userObj.email ||
          userObj.emailAddress ||
          userObj.mail ||
          userObj.contactEmail
        );
      }
      return undefined;
    })
    .filter((email) => email && typeof email === "string");
};
