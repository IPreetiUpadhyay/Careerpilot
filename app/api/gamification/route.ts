import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const LEVELS = [
  { name: "Explorer", min: 0 },
  { name: "Direction Finder", min: 100 },
  { name: "Skill Builder", min: 250 },
  { name: "Portfolio Builder", min: 500 },
  { name: "Job Ready", min: 800 },
  { name: "Applicant", min: 1200 },
  { name: "Interview Ready", min: 1700 },
  { name: "Career Launcher", min: 2300 },
];

const ACHIEVEMENTS = [
  ["career-direction", "Career Direction", "Defined a target career path.", 50],
  ["skill-verified", "Skill Verified", "Verified your first skill.", 100],
  ["builder", "Builder", "Completed a practical project.", 150],
  ["applicant", "Applicant", "Started tracking an application.", 100],
  ["interview-ready", "Interview Ready", "Completed interview practice.", 125],
  ["career-launcher", "Career Launcher", "Reached Career Launcher level.", 250],
];

function levelFor(xp:number) {
  let level = LEVELS[0];
  for (const item of LEVELS) if (xp >= item.min) level = item;
  return { level: LEVELS.indexOf(level) + 1, name: level.name, next: LEVELS[LEVELS.indexOf(level) + 1]?.min ?? null };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const [progress, events, achievements] = await Promise.all([
      db.query("select level,xp,current_streak,longest_streak,updated_at from user_progress where user_id=$1", [session.userId]),
      db.query("select event_type,xp,metadata,created_at from career_events where user_id=$1 order by created_at desc limit 25", [session.userId]),
      db.query("select a.code,a.name,a.description,a.xp_reward,ua.unlocked_at from achievements a left join user_achievements ua on ua.achievement_id=a.id and ua.user_id=$1 order by a.xp_reward", [session.userId]),
    ]);
    const row = progress.rows[0] ?? { level: 1, xp: 0, current_streak: 0, longest_streak: 0 };
    const xp = Number(row.xp || 0);
    const levelInfo = levelFor(xp);
    return NextResponse.json({ progress: { ...levelInfo, xp, currentStreak: Number(row.current_streak), longestStreak: Number(row.longest_streak) }, events: events.rows, achievements: achievements.rows });
  } catch {
    return NextResponse.json({ error: "Could not load gamification data." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

  try {
    const database = db;
    const userId = session.userId;
    const body = await req.json();
    let responseXp = 0;
    let responseInfo = levelFor(0);
    let responseStreak = 0;
    let responseLongest = 0;
    const eventType = String(body.eventType || "").trim();
    const xpReward = Math.max(0, Math.min(500, Number(body.xp || 0)));
    if (!eventType) return NextResponse.json({ error: "eventType is required." }, { status: 400 });

    const metadata = body.metadata || {};
    if (eventType === "quest_completed" && metadata.questId) {
      const existing = await db.query("select 1 from career_events where user_id=$1 and event_type=$2 and metadata->>'questId'=$3 limit 1", [userId, eventType, String(metadata.questId)]);
      if (existing.rows.length) return NextResponse.json({ error: "Quest already claimed." }, { status: 409 });
    }
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query("insert into career_events(user_id,event_type,entity_type,entity_id,xp,metadata) values($1,$2,$3,$4,$5,$6::jsonb)", [userId, eventType, body.entityType || null, body.entityId || null, xpReward, JSON.stringify(metadata)]);
      const progress = await client.query("insert into user_progress(user_id,level,xp,current_streak,longest_streak) values($1,1,$2,case when $2>0 then 1 else 0 end,case when $2>0 then 1 else 0 end) on conflict(user_id) do update set xp=user_progress.xp+excluded.xp,updated_at=now() returning xp,current_streak,longest_streak", [session.userId, xpReward]);
      const xp = Number(progress.rows[0]?.xp || 0);
      const info = levelFor(xp);
      let streak = Number(progress.rows[0]?.current_streak || 0);
      let longest = Number(progress.rows[0]?.longest_streak || 0);
      if (xpReward > 0) {
        const recent = await client.query("select max(created_at)::date as last_day from career_events where user_id=$1 and xp>0", [session.userId]);
        const lastDay = recent.rows[0]?.last_day;
        const yesterday = new Date(); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const todayKey = new Date().toISOString().slice(0,10);
        const yesterdayKey = yesterday.toISOString().slice(0,10);
        const lastKey = lastDay ? String(lastDay).slice(0,10) : "";
        if (lastKey === todayKey) streak = Math.max(1, streak);
        else if (lastKey === yesterdayKey) streak = streak + 1;
        else streak = 1;
        longest = Math.max(longest, streak);
      }
      await client.query("update user_progress set level=$2,current_streak=$3,longest_streak=$4,updated_at=now() where user_id=$1", [userId, info.level, streak, longest]);
      await client.query("commit");
      responseXp = xp;
      responseInfo = info;
      responseStreak = streak;
      responseLongest = longest;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const questAchievement: Record<string,string> = { goal: "career-direction", skill: "skill-verified", project: "builder", application: "applicant", interview: "interview-ready" };
    const achievementCode = String(body.achievementCode || (eventType === "quest_completed" ? questAchievement[String(metadata.questId || "")] || "" : ""));
    const unlocked = ACHIEVEMENTS.filter((x:any) => x[0] === achievementCode);
    for (const a of unlocked) {
      await database.query("insert into achievements(code,name,description,xp_reward) values($1,$2,$3,$4) on conflict(code) do update set name=excluded.name,description=excluded.description,xp_reward=excluded.xp_reward", a);
      await database.query("insert into user_achievements(user_id,achievement_id) select $1,id from achievements where code=$2 on conflict do nothing", [userId, a[0]]);
    }
    return NextResponse.json({ xp: responseXp, ...responseInfo, currentStreak: responseStreak, longestStreak: responseLongest });
  } catch {
    return NextResponse.json({ error: "Could not record career progress." }, { status: 503 });
  }
}
