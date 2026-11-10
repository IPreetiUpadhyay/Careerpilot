import { NextResponse } from "next/server";
import { getSession } from "../../lib/auth";
import { getDb } from "../../lib/db";

function compactCareerState(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const state = value as Record<string, any>;
  return {
    targetRole: state.targetRole ?? null,
    goalSet: Boolean(state.goalSet),
    careerProfile: state.profile ?? state.careerProfile ?? null,
    skills: Array.isArray(state.skills) ? state.skills : [],
    skillGaps: Array.isArray(state.skillGaps) ? state.skillGaps : [],
    roadmap: state.roadmap ?? null,
    projects: Array.isArray(state.projects) ? state.projects : [],
    applications: Array.isArray(state.applications) ? state.applications : [],
    interviews: Array.isArray(state.interviews) ? state.interviews : [],
    learning: state.learning ?? null,
    preferences: state.preferences ?? null,
  };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Career data is temporarily unavailable." }, { status: 503 });

  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 2000) : "";
    if (!question) return NextResponse.json({ error: "Question is required." }, { status: 400 });

    const result = await db.query(
      "select state from career_states where user_id = $1 limit 1",
      [session.userId]
    );
    const careerState = compactCareerState(result.rows[0]?.state) ?? compactCareerState(body.context);
    if (!careerState) {
      return NextResponse.json({
        mode: "local",
        message: "I don't have a saved Career DNA profile yet. Set your target role and career details first, then ask me again.",
        contextAvailable: false,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        mode: "local",
        message: "Your saved Career State is available, but the AI provider is not configured. You can still use the Skill, Roadmap, Project and Job modules for guided actions.",
        contextAvailable: true,
      });
    }

    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const instructions = `You are CareerPilot AI, a practical career intelligence mentor.
Use only the supplied Career State. Never invent skills, experience, qualifications, project results, job outcomes, salaries or immigration rules. Do not claim to have inspected information that is not present. Distinguish self-reported skills from verified evidence when the data allows it. Do not make hiring predictions.
Answer the user's actual question concisely. When useful, give 1-3 prioritized next actions and name the relevant CareerPilot module. Explain why each action matters. If the context is incomplete, state exactly what is missing.

Saved Career State:
${JSON.stringify(careerState)}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        instructions,
        input: question,
        max_output_tokens: 600,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return NextResponse.json({
        mode: "local",
        message: "I couldn't reach the AI service right now. Your saved Career State is intact. Try again shortly.",
        contextAvailable: true,
      });
    }

    const data = await response.json();
    const output = typeof data.output_text === "string" ? data.output_text.trim() : "";
    if (!output) {
      return NextResponse.json({
        mode: "local",
        message: "The AI service returned an empty response. Please try asking in a different way.",
        contextAvailable: true,
      });
    }

    return NextResponse.json({ mode: "ai", message: output, contextAvailable: true });
  } catch {
    return NextResponse.json({ error: "AI Mentor could not load your saved career context. Please try again." }, { status: 503 });
  }
}
