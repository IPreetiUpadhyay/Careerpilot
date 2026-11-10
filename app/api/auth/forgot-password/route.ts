import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getDb } from "../../../lib/db";
import { sendPasswordResetEmail } from "../../../lib/email";

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const user = await db.query("select id,email,name from users where email=$1 limit 1", [email]);
    if (user.rowCount) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await db.query(
        "update users set password_reset_token_hash=$1,password_reset_expires_at=now()+interval '30 minutes',updated_at=now() where id=$2",
        [tokenHash, user.rows[0].id]
      );
      try {
        await sendPasswordResetEmail(user.rows[0].email, user.rows[0].name, token);
      } catch {
        await db.query("update users set password_reset_token_hash=null,password_reset_expires_at=null where id=$1", [user.rows[0].id]);
        return NextResponse.json({ error: "Password reset email could not be sent. Please try again later." }, { status: 503 });
      }
    }

    return NextResponse.json({ message: "If an account exists for this email, a password reset link has been sent." });
  } catch {
    return NextResponse.json({ error: "Could not process the password reset request." }, { status: 503 });
  }
}
