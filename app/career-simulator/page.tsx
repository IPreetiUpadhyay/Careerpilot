"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronRight, Compass, Gauge, Globe2, RotateCcw, Sparkles, Target, TrendingUp } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";
import { calculateCareerReadiness, getSkillGapAnalysis } from "../lib/career-intelligence";

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  changes: { label: string; value: string }[];
  actions: string[];
};

const scenarios: Scenario[] = [
  {
    id: "current",
    title: "Continue toward your target role",
    subtitle: "Strengthen the path you have already started.",
    changes: [
      { label: "Focus", value: "Close skill gaps + build evidence" },
      { label: "Risk", value: "Lower direction change" },
      { label: "Best for", value: "Focused job preparation" }
    ],
    actions: ["Finish the highest-impact skill gaps", "Complete a role-relevant project", "Improve resume evidence"]
  },
  {
    id: "switch",
    title: "Switch career direction",
    subtitle: "Explore what changes when your destination changes.",
    changes: [
      { label: "Focus", value: "Transferable skills + new foundations" },
      { label: "Risk", value: "More learning required" },
      { label: "Best for", value: "Career transition planning" }
    ],
    actions: ["Choose a transition role", "Map transferable skills", "Build a bridge project"]
  },
  {
    id: "edge",
    title: "Stay ahead in your field",
    subtitle: "Keep your current direction while adding emerging capabilities.",
    changes: [
      { label: "Focus", value: "Emerging tools + methods" },
      { label: "Risk", value: "Requires continuous learning" },
      { label: "Best for", value: "Long-term career growth" }
    ],
    actions: ["Explore Career Edge", "Apply one emerging skill", "Capture new evidence"]
  },
  {
    id: "international",
    title: "Target international opportunities",
    subtitle: "Shift the planning lens toward global and remote opportunities.",
    changes: [
      { label: "Focus", value: "Global roles + eligibility" },
      { label: "Risk", value: "More constraints to validate" },
      { label: "Best for", value: "International career planning" }
    ],
    actions: ["Review global role requirements", "Check work authorization needs", "Build internationally relevant evidence"]
  }
];

export default function CareerSimulatorPage() {
  const [state, setState] = useState<CareerState | null>(null);
  const [selected, setSelected] = useState("current");

  useEffect(() => {
    setState(loadCareerState());
    const refresh = () => setState(loadCareerState());
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const selectedScenario = scenarios.find(s => s.id === selected) ?? scenarios[0];

  const analysis = useMemo(() => {
    if (!state) return null;
    const gaps = getSkillGapAnalysis(state).filter(s => s.gap > 0);
    const readiness = calculateCareerReadiness(state);
    const projectCount = state.projects.filter(p => p.status === "completed").length;
    const evidenceCount = state.evidence.length;
    return { gaps, readiness, projectCount, evidenceCount };
  }, [state]);

  if (!state || !analysis) {
    return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading Career Simulator...</main>;
  }

  const scenarioReadiness =
    selected === "current"
      ? analysis.readiness
      : Math.max(0, analysis.readiness - (selected === "switch" ? 12 : selected === "international" ? 6 : 2));

  const scenarioGapCount =
    selected === "switch"
      ? analysis.gaps.length + 2
      : selected === "international"
        ? analysis.gaps.length + 1
        : analysis.gaps.length;

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[18%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-8%] top-[25%] h-[460px] w-[460px] rounded-full bg-cyan-500/[.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1350px] px-4 py-6 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Career Simulator</span>
        </header>

        <section className="py-9 sm:py-12">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Compass size={15}/> Decision intelligence</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">What changes if you choose a different path?</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">Career Simulator lets you compare career scenarios using your current Career State. It is a planning tool, not a prediction engine.</p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <section className="space-y-3">
            {scenarios.map(s => (
              <button key={s.id} onClick={() => setSelected(s.id)} className={"w-full rounded-3xl border p-5 text-left transition " + (selected === s.id ? "border-violet-400/25 bg-violet-400/[.07]" : "border-white/[.07] bg-white/[.025] hover:border-white/[.12]")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold">{s.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">{s.subtitle}</p>
                  </div>
                  {selected === s.id ? <CheckCircle2 size={18} className="shrink-0 text-violet-300"/> : <ChevronRight size={18} className="shrink-0 text-zinc-700"/>}
                </div>
              </button>
            ))}
          </section>

          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[.16em] text-zinc-600">Scenario</p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedScenario.title}</h2>
                <p className="mt-2 text-sm text-zinc-500">{selectedScenario.subtitle}</p>
              </div>
              <div className="rounded-2xl border border-white/[.07] bg-black/10 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-wider text-zinc-700">Current role</p>
                <p className="mt-1 text-xs font-medium text-zinc-300">{state.targetRole || "Not defined"}</p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Metric icon={Gauge} label="Current readiness" value={analysis.readiness + "%"} />
              <Metric icon={Target} label="Scenario signal" value={scenarioReadiness + "%"} />
              <Metric icon={TrendingUp} label="Skill gaps" value={String(scenarioGapCount)} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedScenario.changes.map(x => (
                <div key={x.label} className="rounded-2xl border border-white/[.05] bg-black/10 p-4">
                  <p className="text-[10px] uppercase tracking-[.14em] text-zinc-700">{x.label}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{x.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-violet-400/10 bg-violet-400/[.035] p-5">
              <p className="text-xs font-medium text-violet-200">What this scenario would require</p>
              <div className="mt-4 space-y-3">
                {selectedScenario.actions.map((action, i) => (
                  <div key={action} className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/[.06] text-[10px] text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={selected === "edge" ? "/career-edge" : selected === "international" ? "/jobs" : selected === "switch" ? "/career-goal" : "/skills-gap"} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black">Explore this path <ArrowRight size={14}/></a>
              <a href="/dashboard" className="flex items-center gap-2 rounded-xl border border-white/[.08] px-4 py-3 text-xs text-zinc-400"><RotateCcw size={14}/> Back to current plan</a>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-zinc-700">Scenario signals are planning estimates derived from your current profile and the selected path. They are not forecasts of salary, hiring probability, or career outcomes.</p>
          </section>
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <Mini icon={BriefcaseBusiness} title="Projects" value={String(analysis.projectCount)} detail="Completed evidence" />
          <Mini icon={CheckCircle2} title="Evidence" value={String(analysis.evidenceCount)} detail="Career proof captured" />
          <Mini icon={Globe2} title="Scope" value={state.primaryGoal?.scope || "Not set"} detail="Current opportunity scope" />
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-700"><Icon size={13}/>{label}</div><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}

function Mini({ icon: Icon, title, value, detail }: { icon: typeof BriefcaseBusiness; title: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><Icon size={16} className="text-violet-300"/><p className="mt-3 text-xs text-zinc-600">{title}</p><p className="mt-1 text-lg font-semibold">{value}</p><p className="mt-1 text-[11px] text-zinc-700">{detail}</p></div>;
}
