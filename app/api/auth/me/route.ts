import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { getDb } from "../../../lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const db = getDb();
  if (!db) return NextResponse.json({ user: null });
  const result = await db.query("select id,email,name from users where id = $1", [session.userId]);
  if (!result.rowCount) return NextResponse.json({ user: null });
  return NextResponse.json({ user: result.rows[0] });
}
