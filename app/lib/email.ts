function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char] || char);
}

async function sendCareerPilotEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Email delivery is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error("Email delivery failed.");
}

export async function sendEmailVerification(email: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("Email verification is not configured.");
  const verifyUrl = new URL("/api/account/verify-email", appUrl);
  verifyUrl.searchParams.set("token", token);
  await sendCareerPilotEmail(email, "Verify your CareerPilot email address", `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#171717">
      <h2>Verify your CareerPilot email</h2>
      <p>Hi ${escapeHtml(name || "there")},</p>
      <p>We received a request to change the email address on your CareerPilot account.</p>
      <p><a href="${verifyUrl.toString()}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Verify email address</a></p>
      <p>This link expires in 30 minutes. If you did not request this change, ignore this email.</p>
    </div>`);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("Password reset is not configured.");
  const resetUrl = new URL("/auth/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);
  await sendCareerPilotEmail(email, "Reset your CareerPilot password", `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#171717">
      <h2>Reset your CareerPilot password</h2>
      <p>Hi ${escapeHtml(name || "there")},</p>
      <p>We received a request to reset your password. Use the secure link below to choose a new password.</p>
      <p><a href="${resetUrl.toString()}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Reset password</a></p>
      <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
    </div>`);
}
