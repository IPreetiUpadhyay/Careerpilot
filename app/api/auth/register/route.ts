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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const existing = await db.query("select id from users where email = $1", [email]);
    if (existing.rowCount) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.query(
      "insert into users(email,name,password_hash) values($1,$2,$3) returning id,email,name",
      [email, name, passwordHash]
    );
    const created = user.rows[0];
    await createSession(created.id, created.email);
    return NextResponse.json({ user: { id: created.id, email: created.email, name: created.name } });
  } catch {
    return NextResponse.json({ error: "Could not create account." }, { status: 503 });
  }
}
