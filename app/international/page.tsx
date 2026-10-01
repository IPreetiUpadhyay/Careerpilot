"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Globe2, MapPin, ShieldCheck, Sparkles, BriefcaseBusiness, FileCheck2 } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";
import { getSkillGapAnalysis } from "../lib/career-intelligence";

type Destination = {
  id: string; name: string; region: string; workModes: string[]; planningFocus: string[]; officialHint: string;
};

const destinations: Destination[] = [
  { id: "remote", name: "Remote Worldwide", region: "Global", workModes: ["Remote"], planningFocus: ["Timezone compatibility", "Employer hiring geography", "Work authorization terms"], officialHint: "Verify the employer's stated hiring countries and work authorization requirements." },
  { id: "uk", name: "United Kingdom", region: "Europe", workModes: ["Remote", "Hybrid", "On-site"], planningFocus: ["Role eligibility", "Sponsorship", "Right to work"], officialHint: "Verify current visa and sponsorship rules through UK government sources before relying on a role." },
  { id: "canada", name: "Canada", region: "North America", workModes: ["Remote", "Hybrid", "On-site"], planningFocus: ["Role eligibility", "Work permit", "Employer requirements"], officialHint: "Verify current immigration and work-permit rules through Canadian government sources." },
  { id: "germany", name: "Germany", region: "Europe", workModes: ["Remote", "Hybrid", "On-site"], planningFocus: ["Qualification", "Work authorization", "Language"], officialHint: "Verify current work and residence requirements through official German government sources." },
  { id: "australia", name: "Australia", region: "Oceania", workModes: ["Remote", "Hybrid", "On-site"], planningFocus: ["Occupation eligibility", "Visa pathway", "Employer requirements"], officialHint: "Verify current visa and occupation rules through Australian government sources." },
  { id: "uae", name: "UAE", region: "Middle East", workModes: ["Remote", "Hybrid", "On-site"], planningFocus: ["Employer sponsorship", "Work permit", "Location"], officialHint: "Verify current employment and residence requirements through UAE government sources." }
];

export default function InternationalPage() {
  const [state, setState] = useState<CareerState | null>(null);
  const [selected, setSelected] = useState("remote");

  useEffect(() => {
    const refresh = () => setState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const analysis = useMemo(() => {
    if (!state) return null;
    const gaps = getSkillGapAnalysis(state).filter(x => x.gap > 0);
    const verified = state.skillRecords.filter(x => x.verified).length;
    const projects = state.projects.filter(x => x.status === "completed").length;
    return { gaps, verified, projects };
  }, [state]);

  if (!state || !analysis) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading International Intelligence...</main>;

  const destination = destinations.find(x => x.id === selected) ?? destinations[0];
  const readinessItems = [
    { label: "Target role defined", done: Boolean(state.targetRole) },
    { label: "Skill gaps identified", done: analysis.gaps.length === 0 && Boolean(state.targetRole) },
    { label: "Verified skill evidence", done: analysis.verified > 0 },
    { label: "Practical project evidence", done: analysis.projects > 0 },
    { label: "Opportunity scope selected", done: Boolean(state.primaryGoal?.scope) }
  ];
  const completed = readinessItems.filter(x => x.done).length;

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-10%] top-[20%] h-[460px] w-[460px] rounded-full bg-cyan-500/[.06] blur-[130px]" />
      </div>
      <div className="relative mx-auto max-w-[1350px] px-4 py-6 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">International Intelligence</span>
        </header>

        <section className="py-9 sm:py-12">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Globe2 size={15}/> Global career planning</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Plan beyond your current market.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">Separate the career question from the relocation question. CareerPilot maps what you need for a global opportunity, while immigration and work authorization remain things to verify from official sources.</p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <section className="space-y-2">
            {destinations.map(d => (
              <button key={d.id} onClick={() => setSelected(d.id)} className={"w-full rounded-2xl border p-4 text-left transition " + (selected === d.id ? "border-violet-400/25 bg-violet-400/[.07]" : "border-white/[.07] bg-white/[.025] hover:border-white/[.12]")}>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">{d.name}</span>{selected === d.id && <CheckCircle2 size={16} className="text-violet-300" />}</div>
                <p className="mt-1 text-[11px] text-zinc-700">{d.region}</p>
              </button>
            ))}
          </section>

          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-600"><MapPin size={14}/>{destination.region}</div>
                <h2 className="mt-2 text-2xl font-semibold">{destination.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">Target role: <span className="text-zinc-300">{state.targetRole || "Not defined"}</span></p>
              </div>
              <div className="rounded-2xl border border-white/[.07] bg-black/10 px-5 py-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-700">Planning readiness</p>
                <p className="mt-1 text-2xl font-semibold">{completed}/5</p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Metric icon={BriefcaseBusiness} label="Work modes" value={destination.workModes.join(" · ")} />
              <Metric icon={FileCheck2} label="Skill gaps" value={String(analysis.gaps.length)} />
              <Metric icon={ShieldCheck} label="Verified skills" value={String(analysis.verified)} />
            </div>

            <div className="mt-7">
              <p className="text-xs font-medium text-zinc-300">What to validate</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {destination.planningFocus.map(x => <div key={x} className="rounded-2xl border border-white/[.05] bg-black/10 p-4 text-xs text-zinc-400">{x}</div>)}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-xs font-medium text-zinc-300">Your preparation</p>
              <div className="mt-3 space-y-2">
                {readinessItems.map(x => <div key={x.label} className="flex items-center gap-3 rounded-2xl border border-white/[.05] bg-black/10 p-3 text-xs"><CheckCircle2 size={15} className={x.done ? "text-emerald-300" : "text-zinc-700"}/><span className={x.done ? "text-zinc-300" : "text-zinc-600"}>{x.label}</span></div>)}
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-400/10 bg-amber-400/[.035] p-5">
              <p className="text-xs font-medium text-amber-200">Important</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{destination.officialHint}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/jobs" className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black">Explore opportunities <ArrowRight size={14}/></a>
              <a href="/career-goal" className="flex items-center gap-2 rounded-xl border border-white/[.08] px-4 py-3 text-xs text-zinc-400">Update goal</a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-700"><Icon size={13}/>{label}</div><p className="mt-2 text-xs leading-5 text-zinc-300">{value}</p></div>;
}
