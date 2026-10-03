export async function sendEmailVerification(email: string, name: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey || !from || !appUrl) throw new Error("Email verification is not configured.");

  const verifyUrl = new URL("/api/account/verify-email", appUrl);
  verifyUrl.searchParams.set("token", token);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Verify your CareerPilot email address",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#171717">
        <h2>Verify your CareerPilot email</h2>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to change the email address on your CareerPilot account.</p>
        <p><a href="${verifyUrl.toString()}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Verify email address</a></p>
        <p>This link expires in 30 minutes. If you did not request this change, you can ignore this email.</p>
      </div>`,
    }),
  });

  if (!response.ok) throw new Error("Could not send verification email.");
}
