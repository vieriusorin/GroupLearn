/**
 * Email utility for sending group invitations using Resend
 *
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 * - RESEND_FROM_EMAIL: From email address (e.g., "Your App <noreply@yourdomain.com>")
 */

import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface InvitationEmailData {
  to: string;
  groupName: string;
  invitedBy: string;
  invitationUrl: string;
  expiresAt: string;
}

/**
 * Send a group invitation email
 */
export async function sendInvitationEmail(
  data: InvitationEmailData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
      console.warn(
        "⚠️ RESEND_API_KEY not set, email will not be sent (development mode)",
      );
      console.log("📧 Would send invitation email:");
      console.log("  To:", data.to);
      console.log("  Subject: You've been invited to join", data.groupName);
      console.log("  Invitation URL:", data.invitationUrl);
      return { success: true };
    }

    const resend = getResendClient();
    const emailContent = generateInvitationEmailHtml(data);

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: `You've been invited to join ${data.groupName}`,
      html: emailContent,
      text: generateInvitationEmailText(data),
    });

    // Check if Resend returned an error
    if (result.error) {
      const error = result.error;
      let errorMsg = "";

      // Check for test mode restriction (403 with specific message)
      if (
        error.statusCode === 403 &&
        error.message?.includes("testing emails")
      ) {
        errorMsg =
          'Resend Test Mode Restriction: You are using Resend\'s test email address (onboarding@resend.dev), which only allows sending to your own verified email address. To send invitations to other recipients, you need to:\n\n1. Verify a domain in Resend (go to resend.com/domains)\n2. Set RESEND_FROM_EMAIL to use your verified domain (e.g., "Learning Cards <noreply@yourdomain.com>")\n\nFor now, you can test by sending invitations to your own email address (sorinvieriu@gmail.com).';
      } else if (error.statusCode === 403) {
        errorMsg = `Resend API returned 403 Forbidden: ${error.message || "Access denied"}. This usually means:\n1. Your domain is not verified in Resend\n2. The "from" email address doesn't match a verified domain\n3. Your API key doesn't have the correct permissions\n\nPlease verify your domain at resend.com/domains and ensure RESEND_FROM_EMAIL uses that domain.`;
      } else if (error.statusCode === 401) {
        errorMsg =
          "Resend API returned 401 Unauthorized. Please check that your RESEND_API_KEY is correct and has not been revoked.";
      } else {
        errorMsg = `Resend API error: ${error.message || JSON.stringify(error)}. Make sure your domain is verified in Resend and your API key has the correct permissions.`;
      }

      console.error("❌ Resend API error:", error);
      return {
        success: false,
        error: errorMsg,
      };
    }

    console.log("✅ Invitation email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send invitation email:", error);

    // Extract more detailed error information
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for common Resend error patterns
      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        errorMessage =
          'Resend API returned 403 Forbidden. This usually means: 1) Your domain is not verified in Resend, 2) Your API key is invalid, or 3) The "from" email address doesn\'t match a verified domain. Please verify your domain in Resend and ensure RESEND_FROM_EMAIL uses that domain.';
      } else if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        errorMessage =
          "Resend API returned 401 Unauthorized. Please check that your RESEND_API_KEY is correct.";
      } else if (error.message.includes("domain")) {
        errorMessage = `Domain verification error: ${error.message}. Please verify your domain in Resend.`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate HTML content for invitation email
 */
function generateInvitationEmailHtml(data: InvitationEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Group Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .header h1 {
      color: #111827;
      font-size: 24px;
      margin: 0;
    }
    .content {
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3b82f6;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      text-align: center;
    }
    .button:hover {
      background-color: #2563eb;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e5e7eb;
    }
    .expiry {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're Invited!</h1>
    </div>
    
    <div class="content">
      <p>Hi there!</p>
      
      <p><strong>${data.invitedBy}</strong> has invited you to join the learning group:</p>
      
      <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 20px 0;">
        ${data.groupName}
      </p>
      
      <p>Click the button below to accept this invitation and start learning together:</p>
    </div>
    
    <div class="button-container">
      <a href="${data.invitationUrl}" class="button">
        Accept Invitation
      </a>
    </div>
    
    <div class="expiry">
      ⏰ This invitation expires on <strong>${expiryDate}</strong>
    </div>
    
    <div class="footer">
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      <p style="margin-top: 16px; font-size: 12px;">
        Or copy and paste this URL into your browser:<br>
        <span style="color: #9ca3af; word-break: break-all;">${data.invitationUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text content for invitation email
 */
function generateInvitationEmailText(data: InvitationEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
You're Invited!

Hi there!

${data.invitedBy} has invited you to join the learning group:

${data.groupName}

Click the link below to accept this invitation and start learning together:

${data.invitationUrl}

This invitation expires on ${expiryDate}

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();
}

/**
 * Send a welcome email to a new group member
 */
export async function sendWelcomeEmail(
  to: string,
  groupName: string,
  groupUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "Learning Cards <noreply@yourdomain.com>";

    if (!apiKey) {
      console.warn(
        "⚠️ RESEND_API_KEY not set, email will not be sent (development mode)",
      );
      console.log("📧 Would send welcome email to:", to);
      return { success: true };
    }

    // Validate from email is not using placeholder
    if (fromEmail.includes("yourdomain.com")) {
      const errorMsg =
        "RESEND_FROM_EMAIL must be set to a verified domain. Please configure RESEND_FROM_EMAIL in your environment variables with a domain you've verified in Resend.";
      console.error("❌", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const resend = getResendClient();

    const result = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: `Welcome to ${groupName}!`,
      html: generateWelcomeEmailHtml(groupName, groupUrl),
      text: generateWelcomeEmailText(groupName, groupUrl),
    });

    // Check if Resend returned an error
    if (result.error) {
      const error = result.error;
      let errorMsg = "";

      // Check for test mode restriction (403 with specific message)
      if (
        error.statusCode === 403 &&
        error.message?.includes("testing emails")
      ) {
        errorMsg =
          "Resend Test Mode Restriction: You are using Resend's test email address (onboarding@resend.dev), which only allows sending to your own verified email address. To send welcome emails to other recipients, you need to verify a domain in Resend and set RESEND_FROM_EMAIL to use that domain.";
      } else if (error.statusCode === 403) {
        errorMsg = `Resend API returned 403 Forbidden: ${error.message || "Access denied"}. Please verify your domain at resend.com/domains.`;
      } else if (error.statusCode === 401) {
        errorMsg =
          "Resend API returned 401 Unauthorized. Please check that your RESEND_API_KEY is correct.";
      } else {
        errorMsg = `Resend API error: ${error.message || JSON.stringify(error)}.`;
      }

      console.error("❌ Resend API error:", error);
      return {
        success: false,
        error: errorMsg,
      };
    }

    console.log("✅ Welcome email sent to:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);

    // Extract more detailed error information
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for common Resend error patterns
      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        errorMessage =
          "Resend API returned 403 Forbidden. Please verify your domain at resend.com/domains.";
      } else if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        errorMessage =
          "Resend API returned 401 Unauthorized. Please check that your RESEND_API_KEY is correct.";
      } else if (error.message.includes("domain")) {
        errorMessage = `Domain verification error: ${error.message}. Please verify your domain in Resend.`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate HTML content for welcome email
 */
function generateWelcomeEmailHtml(groupName: string, groupUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${groupName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .header h1 {
      color: #111827;
      font-size: 24px;
      margin: 0;
    }
    .content {
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      text-align: center;
    }
    .button:hover {
      background-color: #059669;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome!</h1>
    </div>
    
    <div class="content">
      <p>Hi there!</p>
      
      <p>You've successfully joined <strong>${groupName}</strong>! We're excited to have you as part of the learning community.</p>
      
      <p>Start exploring your group's content and track your progress:</p>
    </div>
    
    <div class="button-container">
      <a href="${groupUrl}" class="button">
        Go to Your Group
      </a>
    </div>
    
    <div class="footer">
      <p>Happy learning! 📚</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text content for welcome email
 */
function generateWelcomeEmailText(groupName: string, groupUrl: string): string {
  return `
Welcome!

Hi there!

You've successfully joined ${groupName}! We're excited to have you as part of the learning community.

Start exploring your group's content and track your progress:

${groupUrl}

Happy learning!
  `.trim();
}
