import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const context = body.context;

    if (!question) return NextResponse.json({ error: "Question is required." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ mode: "local", message: "AI provider is not configured. CareerPilot can continue using its local career intelligence." });
    }

    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const system = `You are CareerPilot AI, a career intelligence mentor. Give concise, practical, evidence-grounded career guidance. Use only the supplied Career State context. Never invent experience, skills, job outcomes, salary, immigration rules, or qualifications. Do not make hiring predictions. If context is insufficient, say what is missing. Prefer concrete next actions and reference relevant CareerPilot modules when useful.

Career State:
${JSON.stringify(context)}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        instructions: system,
        input: question,
        max_output_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ mode: "local", message: "The AI provider could not be reached right now. Continue with CareerPilot's built-in intelligence." }, { status: 200 });
    }

    const data = await response.json();
    const output = typeof data.output_text === "string" ? data.output_text : "";
    if (!output) return NextResponse.json({ mode: "local", message: "No AI response was returned. Continue with CareerPilot's built-in intelligence." });

    return NextResponse.json({ mode: "ai", message: output });
  } catch {
    return NextResponse.json({ mode: "local", message: "AI Mentor is temporarily using CareerPilot's built-in intelligence." });
  }
}
