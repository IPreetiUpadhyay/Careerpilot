import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const STATUSES = new Set(["active", "completed", "paused", "archived"]);

function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return required ? null : null;
  return trimmed.slice(0, max);
}

function serialize(row: any) {
  return { id: row.id, title: row.title, targetRole: row.target_role ?? null, targetLocation: row.target_location ?? null, workMode: row.work_mode ?? null, status: row.status, targetDate: row.target_date ?? null, createdAt: row.created_at, updatedAt: row.updated_at };
}

async function getUserId() {
  const session = await getSession();
  return session?.userId ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  try {
    const result = await db.query(
      "select id, title, target_role, target_location, work_mode, status, target_date, created_at, updated_at from career_goals where user_id = $1 order by case when status = 'active' then 0 else 1 end, created_at desc",
      [userId]
    );
    return NextResponse.json({ goals: result.rows.map(serialize) });
  } catch { return NextResponse.json({ error: "Could not load career goals." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  try {
    const body = await request.json();
    const title = text(body?.title, 200, true);
    if (!title) return NextResponse.json({ error: "Goal title is required." }, { status: 400 });
    const targetRole = text(body?.targetRole, 160);
    const targetLocation = text(body?.targetLocation, 200);
    const workMode = text(body?.workMode, 100);
    const status = body?.status === undefined ? "active" : text(body.status, 20);
    if (!status || !STATUSES.has(status)) return NextResponse.json({ error: "Invalid goal status." }, { status: 400 });
    const targetDate = body?.targetDate ? text(body.targetDate, 10) : null;
    if (status === "active") {
      await db.query("update career_goals set status = 'archived', updated_at = now() where user_id = $1 and status = 'active'", [userId]);
    }
    const result = await db.query(
      "insert into career_goals (user_id, title, target_role, target_location, work_mode, status, target_date) values ($1, $2, $3, $4, $5, $6, $7) returning id, title, target_role, target_location, work_mode, status, target_date, created_at, updated_at",
      [userId, title, targetRole, targetLocation, workMode, status, targetDate]
    );
    return NextResponse.json({ goal: serialize(result.rows[0]) }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not create career goal." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  try {
    const body = await request.json();
    const id = text(body?.id, 64, true);
    if (!id) return NextResponse.json({ error: "Goal id is required." }, { status: 400 });
    const current = await db.query("select id, title, target_role, target_location, work_mode, status, target_date, created_at, updated_at from career_goals where id = $1 and user_id = $2", [id, userId]);
    if (!current.rowCount) return NextResponse.json({ error: "Career goal not found." }, { status: 404 });
    const existing = current.rows[0];
    const title = body.title === undefined ? existing.title : text(body.title, 200, true);
    if (!title) return NextResponse.json({ error: "Goal title is required." }, { status: 400 });
    const targetRole = body.targetRole === undefined ? existing.target_role : text(body.targetRole, 160);
    const targetLocation = body.targetLocation === undefined ? existing.target_location : text(body.targetLocation, 200);
    const workMode = body.workMode === undefined ? existing.work_mode : text(body.workMode, 100);
    const status = body.status === undefined ? existing.status : text(body.status, 20);
    const targetDate = body.targetDate === undefined ? existing.target_date : (body.targetDate ? text(body.targetDate, 10) : null);
    if (!status || !STATUSES.has(status)) return NextResponse.json({ error: "Invalid goal status." }, { status: 400 });
    if (status === "active") {
      await db.query("update career_goals set status = 'archived', updated_at = now() where user_id = $1 and status = 'active' and id <> $2", [userId, id]);
    }
    const result = await db.query("update career_goals set title = $1, target_role = $2, target_location = $3, work_mode = $4, status = $5, target_date = $6, updated_at = now() where id = $7 and user_id = $8 returning id, title, target_role, target_location, work_mode, status, target_date, created_at, updated_at", [title, targetRole, targetLocation, workMode, status, targetDate, id, userId]);
    return NextResponse.json({ goal: serialize(result.rows[0]) });
  } catch { return NextResponse.json({ error: "Could not update career goal." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  try {
    const body = await request.json();
    const id = text(body?.id, 64, true);
    if (!id) return NextResponse.json({ error: "Goal id is required." }, { status: 400 });
    const result = await db.query("update career_goals set status = 'archived', updated_at = now() where id = $1 and user_id = $2 returning id, title, target_role, target_location, work_mode, status, target_date, created_at, updated_at", [id, userId]);
    if (!result.rowCount) return NextResponse.json({ error: "Career goal not found." }, { status: 404 });
    return NextResponse.json({ goal: serialize(result.rows[0]) });
  } catch { return NextResponse.json({ error: "Could not archive career goal." }, { status: 503 }); }
}