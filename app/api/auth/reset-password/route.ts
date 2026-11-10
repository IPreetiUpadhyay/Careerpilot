import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/db";

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });

  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!token || token.length > 200) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `update users
       set password_hash=$1,password_reset_token_hash=null,password_reset_expires_at=null,updated_at=now()
       where password_reset_token_hash=$2 and password_reset_expires_at > now()
       returning id`,
      [passwordHash, tokenHash]
    );
    if (!result.rowCount) return NextResponse.json({ error: "This reset link is invalid or expired. Request a new one." }, { status: 400 });

    return NextResponse.json({ message: "Password updated. You can now sign in with your new password." });
  } catch {
    return NextResponse.json({ error: "Could not reset your password. Please try again." }, { status: 503 });
  }
}
