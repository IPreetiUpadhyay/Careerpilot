import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/db";
import { createSession } from "../../../lib/auth";

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const result = await db.query("select id,email,name,password_hash from users where email = $1", [email]);
    if (!result.rowCount) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    await createSession(user.id, user.email);
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ error: "Could not sign in." }, { status: 503 });
  }
}
