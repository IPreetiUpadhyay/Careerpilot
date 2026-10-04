"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Flame, Lock, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";

const levels = [
  { name: "Explorer", min: 0, max: 99 },
  { name: "Direction Finder", min: 100, max: 249 },
  { name: "Skill Builder", min: 250, max: 499 },
  { name: "Portfolio Builder", min: 500, max: 799 },
  { name: "Job Ready", min: 800, max: 1199 },
  { name: "Applicant", min: 1200, max: 1699 },
  { name: "Interview Ready", min: 1700, max: 2299 },
  { name: "Career Launcher", min: 2300, max: Infinity },
];

const quests = [
  { id: "goal", title: "Define your career direction", description: "Set a target role and career scope.", xp: 50, done: (s: CareerState) => s.goalSet, href: "/career-goal" },
  { id: "skill", title: "Verify a skill", description: "Turn a claimed skill into evidence.", xp: 100, done: (s: CareerState) => s.progress.verifiedSkills > 0, href: "/skills-gap" },
  { id: "project", title: "Complete a practical project", description: "Build evidence you can show employers.", xp: 150, done: (s: CareerState) => s.progress.completedProjects > 0, href: "/projects" },
  { id: "resume", title: "Strengthen your resume", description: "Align your resume with your target role.", xp: 75, done: () => Boolean(typeof window !== "undefined" && window.localStorage.getItem("careerpilot-resume-text")), href: "/resume-intelligence" },
  { id: "application", title: "Start your job search", description: "Save or track a real opportunity.", xp: 100, done: (s: CareerState) => s.applications.length > 0, href: "/jobs" },
  { id: "interview", title: "Enter Interview Arena", description: "Practice before the real conversation.", xp: 125, done: (s: CareerState) => s.interviews.length > 0, href: "/interview-arena" },
];

export default function ProgressPage() {
  const [state, setState] = useState<CareerState | null>(null);
  const [serverXp, setServerXp] = useState(0);
  const [serverLevel, setServerLevel] = useState(1);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const refresh = async () => {
      setState(loadCareerState());
      try {
        const r = await fetch("/api/gamification", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          setServerXp(Number(d.progress?.xp || 0));
          setServerLevel(Number(d.progress?.level || 1));
        }
      } catch {}
    };
    void refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  if (!state) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading Progress...</main>;

  const xp = serverXp || state.progress.xp || 0;
  const levelIndex = Math.max(0, levels.findIndex(x => xp >= x.min && xp <= x.max));
  const level = levels[levelIndex];
  const next = levels[levelIndex + 1];
  const progress = next ? Math.min(100, Math.round(((xp - level.min) / (next.min - level.min)) * 100)) : 100;
  const completedQuests = quests.filter(q => q.done(state)).length;

  const badges = useMemo(() => [
    { title: "Career Direction", description: "Defined a target career path.", earned: state.goalSet },
    { title: "Skill Verified", description: "Added verified skill evidence.", earned: state.progress.verifiedSkills > 0 },
    { title: "Builder", description: "Completed a practical project.", earned: state.progress.completedProjects > 0 },
    { title: "Applicant", description: "Started tracking applications.", earned: state.applications.length > 0 },
    { title: "Interview Ready", description: "Completed an interview practice session.", earned: state.interviews.length > 0 },
  ], [state]);

  async function claimQuest(id: string, reward: number) {
    if (claiming) return;
    setClaiming(id);
    try {
      const r = await fetch("/api/gamification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "quest_completed", xp: reward, metadata: { questId: id } }) });
      if (r.ok) {
        const d = await r.json();
        setServerXp(Number(d.xp || 0));
        setServerLevel(Number(d.level || 1));
      }
    } finally { setClaiming(null); }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Progress</span>
        </header>
        <section className="grid gap-5 py-9 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs text-violet-300"><Zap size={15}/> Career progression</div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs text-zinc-600">LEVEL {serverLevel || levelIndex + 1}</p><h1 className="mt-1 text-4xl font-semibold tracking-[-.04em]">{level.name}</h1></div>
              <p className="text-2xl font-semibold">{xp.toLocaleString()} <span className="text-xs font-normal text-zinc-600">XP</span></p>
            </div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: progress + "%" }}/></div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-700"><span>{level.min} XP</span><span>{next ? (next.min - xp) + " XP to " + next.name : "Maximum level reached"}</span></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Stat icon={Target} label="Quests" value={completedQuests + "/" + quests.length} />
              <Stat icon={Award} label="Projects" value={String(state.progress.completedProjects)} />
              <Stat icon={Flame} label="Applications" value={String(state.applications.length)} />
            </div>
          </div>
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-xs text-zinc-600">YOUR JOURNEY</p>
            <div className="mt-5 space-y-3">{levels.map((l, i) => <div key={l.name} className="flex items-center gap-3"><div className={"grid h-8 w-8 place-items-center rounded-full border " + (i <= levelIndex ? "border-violet-300/30 bg-violet-300/10 text-violet-200" : "border-white/[.06] text-zinc-700")}>{i < levelIndex ? <CheckCircle2 size={15}/> : i === levelIndex ? <Trophy size={15}/> : <Lock size={13}/>}</div><span className={"text-xs " + (i <= levelIndex ? "text-zinc-300" : "text-zinc-700")}>{l.name}</span></div>)}</div>
          </div>
        </section>
        <section>
          <div className="flex items-end justify-between"><div><p className="text-xs text-zinc-600">ACTIVE MISSIONS</p><h2 className="mt-1 text-xl font-semibold">Build progress that matters.</h2></div><span className="text-xs text-zinc-600">{completedQuests} completed</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{quests.map(q => { const complete = q.done(state); return <div key={q.id} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><div className="flex items-start justify-between"><div className={"grid h-9 w-9 place-items-center rounded-xl " + (complete ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.04] text-zinc-500")}>{complete ? <CheckCircle2 size={17}/> : <Target size={17}/>}</div><span className="text-xs text-violet-300">+{q.xp} XP</span></div><h3 className="mt-4 text-sm font-medium">{q.title}</h3><p className="mt-1 text-xs leading-5 text-zinc-600">{q.description}</p>{complete ? <p className="mt-4 text-xs text-emerald-300">Completed</p> : <div className="mt-4 flex gap-2"><a href={q.href} className="flex-1 rounded-xl border border-white/[.07] px-3 py-2 text-center text-xs text-zinc-400">Open</a><button onClick={() => void claimQuest(q.id, q.xp)} disabled={claiming === q.id} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black">Claim XP</button></div>}</div>; })}</div>
        </section>
        <section className="mt-9">
          <p className="text-xs text-zinc-600">BADGES</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{badges.map(b => <div key={b.title} className={"rounded-2xl border p-4 " + (b.earned ? "border-violet-300/15 bg-violet-300/[.04]" : "border-white/[.06] bg-white/[.02]")}><Award size={18} className={b.earned ? "text-violet-300" : "text-zinc-700"}/><p className={"mt-3 text-xs font-medium " + (b.earned ? "text-zinc-300" : "text-zinc-600")}>{b.title}</p><p className="mt-1 text-[11px] leading-4 text-zinc-700">{b.description}</p></div>)}</div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><Icon size={15} className="text-zinc-600"/><p className="mt-2 text-lg font-semibold">{value}</p><p className="text-[10px] uppercase tracking-wider text-zinc-700">{label}</p></div>;
}
