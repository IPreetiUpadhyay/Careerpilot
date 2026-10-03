import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { defaultCareerState } from "../../lib/career-state";
import { getSession } from "../../lib/auth";

export async function GET(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ mode: "local", state: defaultCareerState });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const user = await db.query("select id from users where id = $1", [session.userId]);
    if (!user.rowCount) return NextResponse.json({ mode: "database", state: defaultCareerState });
    const state = await db.query("select state from career_states where user_id = $1", [user.rows[0].id]);
    return NextResponse.json({ mode: "database", state: state.rows[0]?.state ?? defaultCareerState });
  } catch {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ mode: "local", message: "DATABASE_URL is not configured." });

  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const state = body.state;
    if (!state) return NextResponse.json({ error: "Career state is required." }, { status: 400 });

    const user = await db.query("select id from users where id = $1", [session.userId]);
    await db.query(
      "insert into career_states(user_id,state) values($1,$2) on conflict(user_id) do update set state=excluded.state, updated_at=now()",
      [user.rows[0].id, JSON.stringify(state)]
    );
    return NextResponse.json({ mode: "database", saved: true });
  } catch {
    return NextResponse.json({ error: "Could not save career state." }, { status: 503 });
  }
}
