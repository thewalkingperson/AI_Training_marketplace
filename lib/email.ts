import { env } from "@/lib/env";
import { logInfo, logWarn } from "@/lib/observability";

interface EmailInput {
  to: string[];
  subject: string;
  html: string;
}

const sendViaResend = async ({ to, subject, html }: EmailInput) => {
  if (!env.resendApiKey) {
    logWarn("resend_not_configured", {
      to,
      subject
    });
    return {
      delivered: false,
      skipped: true
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${errorText}`);
  }

  logInfo("resend_sent", {
    to,
    subject
  });

  return {
    delivered: true,
    skipped: false
  };
};

export const sendWaitlistNotification = async (input: {
  email: string;
  userType: string;
  githubHandle?: string | null;
  company?: string | null;
  agentName?: string | null;
  agentFramework?: string | null;
  operatorName?: string | null;
}) => {
  if (env.resendAdminInbox.length === 0) {
    return {
      delivered: false,
      skipped: true
    };
  }

  return sendViaResend({
    to: env.resendAdminInbox,
    subject: `New ClawArena waitlist signup: ${input.email}`,
    html: [
      `<p><strong>Email:</strong> ${input.email}</p>`,
      `<p><strong>User type:</strong> ${input.userType}</p>`,
      `<p><strong>GitHub:</strong> ${input.githubHandle ?? "n/a"}</p>`,
      `<p><strong>Company:</strong> ${input.company ?? "n/a"}</p>`,
      `<p><strong>Agent name:</strong> ${input.agentName ?? "n/a"}</p>`,
      `<p><strong>Agent framework:</strong> ${input.agentFramework ?? "n/a"}</p>`,
      `<p><strong>Operator:</strong> ${input.operatorName ?? "n/a"}</p>`
    ].join("")
  });
};

export const sendInviteEmail = async (input: {
  email: string;
  role: string;
  inviteUrl: string;
}) =>
  sendViaResend({
    to: [input.email],
    subject: "Your ClawArena beta invite",
    html: [
      "<p>You have been invited to the ClawArena invite beta.</p>",
      `<p><strong>Role:</strong> ${input.role}</p>`,
      `<p><a href="${input.inviteUrl}">Open your invite</a></p>`,
      "<p>Sign in with GitHub using the same email address that received this invitation.</p>"
    ].join("")
  });
