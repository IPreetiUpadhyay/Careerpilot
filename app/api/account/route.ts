import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../lib/db";
import { createSession, getSession } from "../../lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const result = await db.query(
      "select id, email, name, phone, preferences, created_at from users where id = $1",
      [session.userId]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json({ user: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Could not load account." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const name = body.name === undefined ? undefined : String(body.name).trim();
    const phone = body.phone === undefined ? undefined : String(body.phone).trim();
    const email = body.email === undefined ? undefined : String(body.email).trim().toLowerCase();
    const newPassword = body.newPassword === undefined ? undefined : String(body.newPassword);
    const preferences = body.preferences;

    const current = await db.query(
      "select id, email, password_hash, name, phone, preferences from users where id = $1",
      [session.userId]
    );
    if (!current.rowCount) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const user = current.rows[0];
    const needsPassword = Boolean(email && email !== user.email) || Boolean(newPassword) || body.requirePassword;
    if (needsPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    if (newPassword !== undefined && newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    if (email && email !== user.email) {
      const existing = await db.query("select id from users where email = $1 and id <> $2", [email, user.id]);
      if (existing.rowCount) return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }

    if (phone !== undefined && phone !== user.phone && phone) {
      const existing = await db.query("select id from users where phone = $1 and id <> $2", [phone, user.id]);
      if (existing.rowCount) return NextResponse.json({ error: "That phone number is already in use." }, { status: 409 });
    }

    const passwordHash = newPassword ? await bcrypt.hash(newPassword, 12) : user.password_hash;
    const nextPreferences = preferences === undefined ? user.preferences ?? {} : preferences;

    const updated = await db.query(
      `update users
       set name = coalesce($1, name),
           phone = case when $2::boolean then nullif($3, '') else phone end,
           email = coalesce($4, email),
           password_hash = $5,
           preferences = $6::jsonb,
           updated_at = now()
       where id = $7
       returning id, email, name, phone, preferences, created_at`,
      [
        name,
        phone !== undefined,
        phone ?? "",
        email,
        passwordHash,
        JSON.stringify(nextPreferences),
        user.id,
      ]
    );

    const updatedUser = updated.rows[0];
    await createSession(updatedUser.id, updatedUser.email);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Email or phone number is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not update account." }, { status: 503 });
  }
}
