const { Resend } = require("resend");
const { env } = require("../config/env");

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

/**
 * Sends the password reset email via Resend.
 * If RESEND_API_KEY isn't configured (e.g. local dev without a Resend
 * account), the reset link is logged to the console instead of throwing,
 * so the rest of the flow can still be exercised.
 */
async function sendPasswordResetEmail(to, resetLink) {
  if (!resend) {
    console.warn(
      `[email.service] RESEND_API_KEY is not set. Would have emailed a reset link to ${to}:\n${resetLink}`
    );
    return;
  }

  await resend.emails.send({
    from: env.resendFrom,
    to,
    subject: "Reset your password",
    html: buildResetEmailHtml(resetLink),
  });
}

function buildResetEmailHtml(resetLink) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. This link expires in 30 minutes.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#6b7280;font-size:12px;">Link: ${resetLink}</p>
    </div>
  `;
}

module.exports = { sendPasswordResetEmail };
