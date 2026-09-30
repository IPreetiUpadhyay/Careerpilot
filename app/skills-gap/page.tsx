"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft, CircleAlert, Gauge, Sparkles, Target } from "lucide-react";
import { loadCareerState, CareerState } from "../lib/career-state";
import { buildSkillAnalysis, getSkillSummary, SkillAnalysis } from "../lib/skill-engine";

const filters = ["All", "Critical", "High", "Medium"] as const;
type Filter = (typeof filters)[number];

export default function SkillsGapPage() {
  const [careerState, setCareerState] = useState<CareerState | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedName, setSelectedName] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setCareerState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const analysis = useMemo(() => careerState ? buildSkillAnalysis(careerState) : [], [careerState]);

  useEffect(() => {
    if (analysis.length && !analysis.some((item) => item.name === selectedName)) {
      const firstGap = analysis.find((item) => item.current < item.required);
      setSelectedName(firstGap?.name ?? analysis[0].name);
    }
  }, [analysis, selectedName]);

  if (!careerState || !analysis.length) {
    return <main className="min-h-screen bg-[#08090d] text-zinc-100"><div className="mx-auto max-w-4xl px-6 py-20"><p className="text-sm text-violet-300">Skills Intelligence</p><h1 className="mt-3 text-4xl font-semibold">Build your career goal first.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">CareerPilot uses your selected role and skill map to calculate the gaps that matter.</p><a href="/career-goal" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Set career goal <ArrowRight size={16} /></a></div></main>;
  }

  const selected = analysis.find((item) => item.name === selectedName) ?? analysis[0];
  const filtered = analysis.filter((skill) => filter === "All" || skill.priority === filter);
  const summary = getSkillSummary(analysis);

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute left-[15%] top-[-18%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" /><div className="absolute right-[-8%] top-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.06] blur-[120px]" /></div>
      <div className="relative mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6"><a href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ChevronLeft size={17} /> Dashboard</a><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Target size={16} /></span>CareerPilot</div><span className="text-xs text-zinc-600">Skills Intelligence</span></header>

        <section className="mt-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2 text-xs font-medium text-cyan-300"><Sparkles size={14} /> Connected to Career Goal</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Close the gaps that matter for {careerState.targetRole}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">This analysis is generated from your shared CareerPilot state. Change your target role or opportunity scope and the skill priorities can change with it.</p></div><div className="rounded-2xl border border-white/[.07] bg-white/[.025] px-5 py-4"><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Target career</p><p className="mt-2 font-medium">{careerState.targetRole}</p><p className="mt-1 text-xs text-zinc-600">{careerState.geography} · {careerState.workMode}</p></div></div></section>

        <section className="mt-7 grid gap-4 md:grid-cols-3"><Stat label="Career readiness" value={`${summary.readiness}%`} sub="Across role-relevant skills" icon={<Gauge size={16} />} /><Stat label="Priority gaps" value={`${summary.gaps}`} sub={`${summary.critical} critical`} icon={<CircleAlert size={16} />} /><Stat label="Skill map" value={`${analysis.length}`} sub={`${careerState.skills.length} skills from your career state`} icon={<Target size={16} />} /></section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_.85fr]">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold">Skill gap map</h2><p className="mt-1 text-sm text-zinc-500">Current signal vs. estimated requirement for {careerState.targetRole}</p></div><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === item ? "bg-white text-zinc-900" : "border border-white/[.08] bg-white/[.03] text-zinc-500 hover:bg-white/[.06]"}`}>{item}</button>)}</div></div>
            <div className="space-y-3">{filtered.map((skill) => { const gap = Math.max(skill.required - skill.current, 0); const done = completed.includes(skill.name); return <button key={skill.name} onClick={() => setSelectedName(skill.name)} className={`w-full rounded-2xl border p-4 text-left transition ${selected.name === skill.name ? "border-cyan-400/30 bg-cyan-400/[.05]" : "border-white/[.06] bg-black/10 hover:bg-white/[.035]"}`}><div className="flex items-center justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{skill.name}</span><Priority priority={skill.priority} />{done && <span className="text-xs text-emerald-300">✓ Action complete</span>}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${skill.current}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-zinc-600"><span>Current {skill.current}%</span><span>Required {skill.required}%</span></div></div><div className="hidden text-right sm:block"><div className="text-lg font-semibold">{gap > 0 ? `-${gap}%` : "Ready"}</div><div className="text-[11px] text-zinc-600">gap</div></div></div></button>; })}</div>
          </div>

          <aside className="rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[.07] to-white/[.02] p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[.16em] text-cyan-300">Next best action</p><h2 className="mt-2 text-2xl font-semibold">{selected.name}</h2></div><Priority priority={selected.priority} /></div><p className="mt-4 text-sm leading-6 text-zinc-400">Your current signal is <strong className="text-white">{selected.current}%</strong>. CareerPilot estimates <strong className="text-white">{selected.required}%</strong> is needed for your selected target.</p><div className="mt-5 rounded-2xl border border-white/[.07] bg-black/10 p-4"><p className="text-xs text-zinc-600">Why this matters</p><p className="mt-2 text-sm leading-6 text-zinc-400">{selected.reason}</p></div><div className="mt-4 rounded-2xl border border-white/[.07] bg-black/10 p-4"><p className="text-xs text-zinc-600">Recommended action</p><p className="mt-2 text-sm font-medium">{selected.action}</p><div className="mt-3 flex items-center justify-between text-xs text-zinc-600"><span>Evidence type</span><span className="text-zinc-300">{selected.evidence}</span></div></div><button onClick={() => setCompleted((items) => items.includes(selected.name) ? items : [...items, selected.name])} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-cyan-50">{completed.includes(selected.name) ? <><CheckCircle2 size={16} /> Action recorded</> : <>Start this action <ArrowRight size={16} /></>}</button><p className="mt-3 text-center text-xs text-zinc-600">Completing actions will become evidence for your roadmap and readiness.</p></aside>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[.07] bg-white/[.025] p-6"><p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Intelligence layer</p><h2 className="mt-1 text-lg font-semibold">Why the skill map is connected</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">CareerPilot is no longer treating Skills Gap as an isolated screen. Your selected role, geography, work mode and skills come from shared Career State, which can later feed learning, projects, resumes and job matching.</p></section>
      </div>
    </main>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><div className="flex items-center gap-2 text-zinc-600">{icon}<span className="text-xs">{label}</span></div><div className="mt-2 text-2xl font-semibold">{value}</div><div className="mt-1 text-xs text-zinc-600">{sub}</div></div>; }

function Priority({ priority }: { priority: SkillAnalysis["priority"] }) { const styles = { Critical: "bg-rose-400/10 text-rose-300", High: "bg-amber-300/10 text-amber-300", Medium: "bg-slate-400/10 text-slate-400" }; return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[priority]}`}>{priority}</span>; }
