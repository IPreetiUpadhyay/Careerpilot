"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, FileText, FolderKanban, Gauge, MessageCircle, Send, Sparkles, Target, TrendingUp, Bot } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";
import { calculateCareerReadiness, getSkillGapAnalysis } from "../lib/career-intelligence";

type Message = { id: string; role: "user" | "mentor"; text: string };

const STORAGE_KEY = "careerpilot-mentor-messages";
const prompts = [
  "What should I focus on right now?",
  "Why am I not job-ready yet?",
  "What should I learn this month?",
  "Review my career plan",
  "How can I improve my interview preparation?"
];

export default function AIMentorPage() {
  const [state, setState] = useState<CareerState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const refresh = () => setState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setMessages(saved);
    } catch {}
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  useEffect(() => {
    if (messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const analysis = useMemo(() => {
    if (!state) return null;
    const gaps = getSkillGapAnalysis(state).filter(s => s.gap > 0).sort((a,b) => b.gap-a.gap);
    return {
      readiness: calculateCareerReadiness(state),
      gaps,
      projects: state.projects.filter(p => p.status === "completed").length,
      applications: state.applications.length,
      interviews: state.interviews.length
    };
  }, [state]);

  if (!state || !analysis) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading CareerPilot AI...</main>;

  const send = (text = input) => {
    const clean = text.trim();
    if (!clean) return;
    const reply = buildMentorReply(clean, state, analysis);
    setMessages(prev => prev.concat([
      { id: crypto.randomUUID(), role: "user", text: clean },
      { id: crypto.randomUUID(), role: "mentor", text: reply }
    ]));
    setInput("");
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-10%] top-[20%] h-[460px] w-[460px] rounded-full bg-cyan-500/[.06] blur-[130px]" />
      </div>
      <div className="relative mx-auto max-w-[1250px] px-4 py-6 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot AI</div>
          <button onClick={clear} className="text-xs text-zinc-600 hover:text-zinc-300">Clear chat</button>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-[1fr_310px]">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Bot size={15}/> Career Mentor</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Your career, with context.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Ask CareerPilot about your direction, skills, learning, portfolio, applications or interviews. Responses are grounded in your current Career State.</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {prompts.map(p => <button key={p} onClick={() => send(p)} className="rounded-full border border-white/[.08] bg-white/[.025] px-3 py-2 text-xs text-zinc-400 transition hover:border-violet-400/20 hover:text-zinc-200">{p}</button>)}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/[.07] bg-white/[.02]">
              <div className="min-h-[390px] max-h-[560px] space-y-4 overflow-y-auto p-5 sm:p-6">
                {messages.length === 0 && (
                  <div className="flex min-h-[350px] items-center justify-center text-center">
                    <div className="max-w-md">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><Bot size={22}/></div>
                      <h2 className="mt-4 text-lg font-semibold">What are we solving?</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">Start with one of the prompts above, or tell me exactly what you're stuck on.</p>
                    </div>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={m.role === "user" ? "max-w-[82%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm text-black" : "max-w-[88%] rounded-2xl rounded-bl-md border border-white/[.07] bg-white/[.035] px-4 py-3 text-sm leading-6 text-zinc-300"}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[.07] p-3">
                <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your career mentor..." className="min-w-0 flex-1 rounded-xl border border-white/[.07] bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/30" />
                  <button className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-black"><Send size={16}/></button>
                </form>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5">
              <p className="text-xs uppercase tracking-[.16em] text-zinc-600">Your context</p>
              <div className="mt-4 space-y-3">
                <Context icon={Target} label="Target role" value={state.targetRole || "Not set"} />
                <Context icon={Gauge} label="Career readiness" value={analysis.readiness + "%"} />
                <Context icon={TrendingUp} label="Skill gaps" value={String(analysis.gaps.length)} />
                <Context icon={FolderKanban} label="Completed projects" value={String(analysis.projects)} />
                <Context icon={BriefcaseBusiness} label="Applications" value={String(analysis.applications)} />
                <Context icon={MessageCircle} label="Interview sessions" value={String(analysis.interviews)} />
              </div>
            </div>
            <div className="rounded-3xl border border-violet-400/10 bg-violet-400/[.04] p-5">
              <p className="text-xs font-medium text-violet-200">Mentor principle</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">The mentor turns your existing career data into decisions and actions, not generic motivational advice.</p>
            </div>
            <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5">
              <p className="text-xs uppercase tracking-[.16em] text-zinc-600">Quick routes</p>
              <div className="mt-3 space-y-2">
                <Route icon={Gauge} label="Skill Intelligence" href="/skills-gap" />
                <Route icon={FileText} label="Resume Intelligence" href="/resume-intelligence" />
                <Route icon={FolderKanban} label="Projects" href="/projects" />
                <Route icon={BriefcaseBusiness} label="Jobs" href="/jobs" />
                <Route icon={MessageCircle} label="Interview Arena" href="/interview-arena" />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Context({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[.05] bg-black/10 p-3"><div className="flex items-center gap-2 text-xs text-zinc-500"><Icon size={14}/>{label}</div><span className="text-xs font-medium text-zinc-300">{value}</span></div>;
}

function Route({ icon: Icon, label, href }: { icon: typeof Target; label: string; href: string }) {
  return <a href={href} className="flex items-center gap-3 rounded-xl border border-white/[.05] px-3 py-2.5 text-xs text-zinc-500 hover:text-white"><Icon size={14}/>{label}<ArrowRight size={13} className="ml-auto"/></a>;
}

function buildMentorReply(question: string, state: CareerState, a: { readiness: number; gaps: { skill: string; gap: number }[]; projects: number; applications: number; interviews: number }) {
  const q = question.toLowerCase();
  const role = state.targetRole || "your target role";
  const gapNames = a.gaps.slice(0, 3).map(g => g.skill);

  if (!state.goalSet || !state.targetRole) return "Your first priority is defining a target role. Once that is set, CareerPilot can map the required skills, identify gaps and build a focused path instead of giving you generic career advice.";
  if (q.includes("focus") || q.includes("next")) {
    if (a.gaps.length) return "For " + role + ", focus first on " + gapNames.join(", ") + ". Your current readiness is " + a.readiness + "%. I would close the largest skill gap first, then create evidence through a practical project. Start with Skill Intelligence → Learning → Projects.";
    if (a.projects === 0) return "Your skill map is in place, but you have no completed project evidence yet. For " + role + ", build one practical project that demonstrates your strongest required skills before pushing harder on applications.";
    if (a.applications === 0) return "You have project evidence but no applications recorded. Move into Jobs, review role-fit opportunities and start tracking applications so CareerPilot can learn from your outcomes.";
    return "You have a foundation for " + role + ". Keep the loop moving: strengthen evidence, apply selectively, and use Interview Arena after applications start generating interview opportunities.";
  }
  if (q.includes("job-ready") || q.includes("ready")) return "Career readiness is currently " + a.readiness + "%. The biggest blockers are " + (gapNames.length ? gapNames.join(", ") : "evidence and role-specific proof") + ". Readiness here is a CareerPilot signal based on your current profile, skills and evidence, not a guarantee of hiring.";
  if (q.includes("learn") || q.includes("month")) return gapNames.length ? "For the next month, build around " + gapNames.join(", ") + ". Use Learning for the concept, a practical challenge for application, then Projects to turn the skill into evidence." : "Your current skill map does not show a major gap. Use Career Edge to stay current, then turn one emerging skill into a project or measurable portfolio artifact.";
  if (q.includes("interview")) return a.interviews ? "You have completed " + a.interviews + " interview session" + (a.interviews === 1 ? "" : "s") + ". Review the feedback there, then repeat the weakest interview type rather than practicing everything equally." : "You have no interview sessions recorded yet. Once your resume and target role are ready, use Interview Arena for role-specific HR, technical, behavioral or case practice.";
  if (q.includes("plan") || q.includes("career")) return "Your current direction is " + role + ", with " + a.readiness + "% CareerPilot readiness, " + a.gaps.length + " identified skill gap" + (a.gaps.length === 1 ? "" : "s") + ", " + a.projects + " completed project" + (a.projects === 1 ? "" : "s") + ", and " + a.applications + " application" + (a.applications === 1 ? "" : "s") + ". The plan should now focus on closing gaps, proving skills and creating real application feedback.";
  return "I can help with " + role + ", but I want to ground the answer in your actual Career State. Right now you have " + a.gaps.length + " skill gaps, " + a.projects + " completed projects and " + a.applications + " applications. Ask me what to focus on, what to learn, how to prepare for interviews, or how to improve your career plan.";
}
