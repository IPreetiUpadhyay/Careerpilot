import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const MAX = { currentRole: 160, education: 200, educationDetails: 300, interests: 500, targetRole: 160, workMode: 100, geography: 200, bio: 2000 };

function cleanString(value: unknown, max: number) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function cleanSkills(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 50).map((item) => item.slice(0, 100));
}

function serialize(row: any) {
  const preferences = row?.preferences && typeof row.preferences === "object" ? row.preferences : {};
  return {
    currentRole: row?.current_role ?? null,
    education: row?.education_level ?? null,
    educationDetails: row?.education_details ?? null,
    interests: typeof preferences.interests === "string" ? preferences.interests : "",
    skills: cleanSkills(preferences.skills),
    currentStatus: row?.current_status ?? null,
    yearsExperience: row?.years_experience == null ? null : Number(row.years_experience),
    targetRole: row?.target_role ?? null,
    workMode: row?.work_mode ?? null,
    geography: row?.geography ?? null,
    internationalInterest: Boolean(row?.international_interest),
    remoteInterest: Boolean(row?.remote_interest),
    bio: row?.bio ?? null,
    updatedAt: row?.updated_at ?? null,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const result = await db.query(`select u.id, u.email, u.name, cp.current_status, cp.education_level, cp.education_details, cp.years_experience, cp."current_role", cp.target_role, cp.work_mode, cp.geography, cp.international_interest, cp.remote_interest, cp.bio, cp.preferences, cp.updated_at
      from users u left join career_profiles cp on cp.user_id = u.id where u.id = $1 limit 1`, [session.userId]);
    if (!result.rowCount) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const row = result.rows[0];
    return NextResponse.json({ user: { id: row.id, email: row.email, name: row.name }, profile: row.current_role || row.education_level || row.preferences ? serialize(row) : null });
  } catch { return NextResponse.json({ error: "Could not load Career DNA." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const fields = {
      currentRole: cleanString(body.currentRole, MAX.currentRole),
      education: cleanString(body.education, MAX.education),
      educationDetails: cleanString(body.educationDetails, MAX.educationDetails),
      currentStatus: cleanString(body.currentStatus, 100),
      targetRole: cleanString(body.targetRole, MAX.targetRole),
      workMode: cleanString(body.workMode, MAX.workMode),
      geography: cleanString(body.geography, MAX.geography),
      bio: cleanString(body.bio, MAX.bio),
      interests: cleanString(body.interests, MAX.interests),
    };
    const yearsExperience = body.yearsExperience === "" || body.yearsExperience == null ? null : Number(body.yearsExperience);
    if (yearsExperience !== null && (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 50)) return NextResponse.json({ error: "Years of experience must be between 0 and 50." }, { status: 400 });
    if (body.skills !== undefined && !Array.isArray(body.skills)) return NextResponse.json({ error: "Skills must be an array." }, { status: 400 });

    for (const [key, value] of Object.entries(fields)) {
      if (body[key] !== undefined && body[key] !== null && typeof body[key] !== "string") return NextResponse.json({ error: `${key} must be text.` }, { status: 400 });
    }

    const user = await db.query("select id, email, name from users where id = $1", [session.userId]);
    if (!user.rowCount) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const existing = await db.query("select preferences from career_profiles where user_id = $1", [session.userId]);
    const existingPreferences = existing.rows[0]?.preferences && typeof existing.rows[0].preferences === "object" ? existing.rows[0].preferences : {};
    const preferences = {
      ...existingPreferences,
      ...(body.interests !== undefined ? { interests: fields.interests ?? "" } : {}),
      ...(body.skills !== undefined ? { skills: cleanSkills(body.skills) } : {}),
    };

    const result = await db.query(`insert into career_profiles
      (user_id, current_status, education_level, education_details, years_experience, "current_role", target_role, work_mode, geography, international_interest, remote_interest, bio, preferences, updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,now())
      on conflict (user_id) do update set
        current_status = coalesce(excluded.current_status, career_profiles.current_status),
        education_level = coalesce(excluded.education_level, career_profiles.education_level),
        education_details = coalesce(excluded.education_details, career_profiles.education_details),
        years_experience = coalesce(excluded.years_experience, career_profiles.years_experience),
        "current_role" = coalesce(excluded."current_role", career_profiles."current_role"),
        target_role = coalesce(excluded.target_role, career_profiles.target_role),
        work_mode = coalesce(excluded.work_mode, career_profiles.work_mode),
        geography = coalesce(excluded.geography, career_profiles.geography),
        international_interest = excluded.international_interest,
        remote_interest = excluded.remote_interest,
        bio = coalesce(excluded.bio, career_profiles.bio),
        preferences = excluded.preferences,
        updated_at = now()
      returning current_status, education_level, education_details, years_experience, "current_role", target_role, work_mode, geography, international_interest, remote_interest, bio, preferences, updated_at`,
      [session.userId, fields.currentStatus, fields.education, fields.educationDetails ?? fields.education, yearsExperience, fields.currentRole, fields.targetRole, fields.workMode, fields.geography, Boolean(body.internationalInterest), Boolean(body.remoteInterest), fields.bio, JSON.stringify(preferences)]
    );

    return NextResponse.json({ user: user.rows[0], profile: serialize(result.rows[0]) });
  } catch { return NextResponse.json({ error: "Could not save Career DNA." }, { status: 503 }); }
}
