"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink, Gauge, Layers3, Sparkles, Target } from "lucide-react";
import { CareerState, loadCareerState, saveCareerState } from "../lib/career-state";
import { calculateCareerReadiness, calculateSkillReadiness, getSkillGapAnalysis, syncSkillRecords } from "../lib/career-intelligence";

type Resource = {
  title: string;
  provider: string;
  type: "Learn" | "Practice" | "Project";
  level: "Beginner" | "Intermediate";
  duration: string;
  url: string;
};

const RESOURCE_CATALOG: Record<string, Resource[]> = {
  SQL: [
    { title: "SQL learning path", provider: "SQLBolt", type: "Learn", level: "Beginner", duration: "3–5h", url: "https://sqlbolt.com/" },
    { title: "SQL practice", provider: "HackerRank", type: "Practice", level: "Beginner", duration: "2–4h", url: "https://www.hackerrank.com/domains/sql" },
    { title: "Build a data analysis case study", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "4–6h", url: "#" },
  ],
  Excel: [
    { title: "Excel training", provider: "Microsoft Support", type: "Learn", level: "Beginner", duration: "3–5h", url: "https://support.microsoft.com/en-us/excel" },
    { title: "Spreadsheet practice", provider: "CareerPilot Practice Lab", type: "Practice", level: "Beginner", duration: "1–3h", url: "#" },
    { title: "Build an analysis dashboard", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "4–6h", url: "#" },
  ],
  "Power BI": [
    { title: "Power BI learning", provider: "Microsoft Learn", type: "Learn", level: "Beginner", duration: "4–6h", url: "https://learn.microsoft.com/training/powerplatform/power-bi/" },
    { title: "Dashboard practice", provider: "Microsoft Learn", type: "Practice", level: "Beginner", duration: "2–3h", url: "https://learn.microsoft.com/training/powerplatform/power-bi/" },
    { title: "Build an executive dashboard", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "5–7h", url: "#" },
  ],
  Python: [
    { title: "Python fundamentals", provider: "freeCodeCamp", type: "Learn", level: "Beginner", duration: "5–8h", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/" },
    { title: "Python practice", provider: "Kaggle Learn", type: "Practice", level: "Beginner", duration: "2–4h", url: "https://www.kaggle.com/learn/python" },
    { title: "Exploratory data analysis project", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "5–7h", url: "#" },
  ],
  Statistics: [
    { title: "Statistics foundations", provider: "Khan Academy", type: "Learn", level: "Beginner", duration: "4–6h", url: "https://www.khanacademy.org/math/statistics-probability" },
    { title: "Statistics practice", provider: "Khan Academy", type: "Practice", level: "Beginner", duration: "2–4h", url: "https://www.khanacademy.org/math/statistics-probability" },
    { title: "Analyze a real dataset", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "4–6h", url: "#" },
  ],
  "Data Visualization": [
    { title: "Data visualization basics", provider: "Microsoft Learn", type: "Learn", level: "Beginner", duration: "3–5h", url: "https://learn.microsoft.com/training/" },
    { title: "Visualization practice", provider: "Kaggle Learn", type: "Practice", level: "Beginner", duration: "2–3h", url: "https://www.kaggle.com/learn/data-visualization" },
    { title: "Create a portfolio dashboard", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "5–7h", url: "#" },
  ],
};

const FALLBACK_RESOURCES: Resource[] = [
  { title: "Learn the fundamentals", provider: "CareerPilot Learning Map", type: "Learn", level: "Beginner", duration: "3–5h", url: "#" },
  { title: "Complete a practical challenge", provider: "CareerPilot Practice Lab", type: "Practice", level: "Beginner", duration: "1–3h", url: "#" },
  { title: "Build a proof-of-skill project", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", duration: "4–6h", url: "#" },
];

export default function LearningIntelligencePage() {
  const [state, setState] = useState<CareerState | null>(null);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const refresh = async () => {
      const local = syncSkillRecords(loadCareerState());
      try {
        const response = await fetch("/api/learning", { cache: "no-store" });
        const result = await response.json();
        if (response.ok && Array.isArray(result.skills)) {
          const records = result.skills.map((item: any) => ({
            name: item.name,
            currentLevel: Number(item.readiness || 0),
            targetLevel: 100,
            confidence: item.verification_status === "unverified" ? 0 : 60,
            evidence: [],
            verified: item.verification_status !== "unverified",
            lastUpdated: new Date().toISOString(),
          }));
          setState({ ...local, targetRole: result.targetRole || local.targetRole, skillRecords: records });
        } else setState(local);
      } catch { setState(local); }
    };
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const analysis = useMemo(() => {
    if (!state) return [];
    const importance = { high: 3, medium: 2, low: 1 };
    return getSkillGapAnalysis(syncSkillRecords(state))
      .filter((skill) => skill.gap > 0)
      .sort((a, b) => importance[b.importance] - importance[a.importance] || b.gap - a.gap);
  }, [state]);

  useEffect(() => {
    if (analysis.length && !analysis.some((skill) => skill.skill === selectedSkill)) {
      setSelectedSkill(analysis[0].skill);
    }
  }, [analysis, selectedSkill]);

  if (!state) return <Loading />;
  if (!state.goalSet || !state.targetRole) return <EmptyState />;

  const selected = analysis.find((skill) => skill.skill === selectedSkill) ?? analysis[0];
  const resources = selected ? RESOURCE_CATALOG[selected.skill] ?? FALLBACK_RESOURCES : [];
  const skillReadiness = calculateSkillReadiness(state);
  const careerReadiness = calculateCareerReadiness(state);
  const totalActions = analysis.length * 3;
  const progress = totalActions ? Math.min(100, Math.round((completed.length / totalActions) * 100)) : 100;

  function complete(resource: Resource) {
    if (!selected) return;
    const key = selected.skill + ":" + resource.title;
    if (completed.includes(key)) return;
    setCompleted((items) => [...items, key]);

    const current = loadCareerState();
    const isProject = resource.type === "Project";

    saveCareerState({
      ...current,
      evidence: isProject
        ? [...current.evidence, {
            id: "learning-" + Date.now(),
            type: "project",
            title: resource.title,
            skillNames: [selected.skill],
            strength: 35,
            createdAt: new Date().toISOString(),
          }]
        : current.evidence,
      progress: {
        ...current.progress,
        completedActions: current.progress.completedActions + 1,
        totalActions: Math.max(current.progress.totalActions, totalActions),
        completedProjects: current.progress.completedProjects + (isProject ? 1 : 0),
        xp: current.progress.xp + (isProject ? 50 : 15),
      },
      lastActionId: "learning-" + selected.skill,
    });
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[-18%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-8%] top-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <a href="/skills-gap" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ArrowLeft size={16} /> Skill Intelligence</a>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><BookOpen size={16} /></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Learning Intelligence</span>
        </header>

        <section className="py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-300"><Sparkles size={14} /> Personalized learning</div>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Turn your skill gaps into a path to <span className="text-cyan-300">{state.targetRole}</span>.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">CareerPilot prioritizes what you need to learn next instead of throwing a giant course catalogue at you.</p>
            </div>
            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Target role</p>
              <p className="mt-2 font-medium">{state.targetRole}</p>
              <p className="mt-1 text-xs text-zinc-600">{state.geography} · {state.workMode}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric icon={Gauge} label="Skill readiness" value={skillReadiness + "%"} note="Before learning" />
          <Metric icon={Target} label="Career readiness" value={careerReadiness + "%"} note="Current state" />
          <Metric icon={Layers3} label="Active paths" value={String(analysis.length)} note="Skills with gaps" />
          <Metric icon={Check} label="Learning progress" value={progress + "%"} note={completed.length + " actions recorded"} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Learning queue</p>
            <h2 className="mt-1 text-lg font-semibold">What should you learn next?</h2>
            <p className="mt-1 text-xs text-zinc-600">Ordered by career importance first, then size of the skill gap.</p>

            <div className="mt-6 space-y-3">
              {analysis.length === 0 ? (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04] p-5">
                  <p className="font-medium text-emerald-200">Your mapped skill gaps are closed.</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-600">The next stage is building evidence, projects and preparing for relevant opportunities.</p>
                </div>
              ) : analysis.map((skill) => {
                const active = selected?.skill === skill.skill;
                const progress = Math.min(Math.round((skill.currentLevel / skill.targetLevel) * 100), 100);
                return (
                  <button key={skill.skill} onClick={() => setSelectedSkill(skill.skill)} className={"w-full rounded-2xl border p-4 text-left transition " + (active ? "border-cyan-300/25 bg-cyan-300/[.045]" : "border-white/[.06] bg-black/10 hover:bg-white/[.025]")}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium">{skill.skill}</span><Importance value={skill.importance} /></div>
                        <p className="mt-1 text-xs text-zinc-600">{skill.gap} point gap · target {skill.targetLevel}%</p>
                      </div>
                      <div className="text-right"><p className="text-sm font-semibold">{skill.currentLevel}%</p><p className="text-[10px] text-zinc-700">current</p></div>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: progress + "%" }} /></div>
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <aside className="rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[.07] to-white/[.02] p-6">
              <p className="text-[10px] uppercase tracking-[.18em] text-cyan-300">Learning path</p>
              <h2 className="mt-2 text-2xl font-semibold">{selected.skill}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">You are at <strong className="text-white">{selected.currentLevel}%</strong>. CareerPilot is targeting <strong className="text-white">{selected.targetLevel}%</strong>, leaving a <strong className="text-white">{selected.gap}-point</strong> gap.</p>

              <div className="mt-6 space-y-3">
                {resources.map((resource, index) => {
                  const key = selected.skill + ":" + resource.title;
                  const done = completed.includes(key);
                  return (
                    <div key={resource.title} className="rounded-2xl border border-white/[.07] bg-black/10 p-4">
                      <div className="flex gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[.05] text-xs text-cyan-300">{done ? <Check size={14} /> : index + 1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-sm font-medium">{resource.title}</p><p className="mt-1 text-[11px] text-zinc-600">{resource.provider} · {resource.duration}</p></div>
                            <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] text-zinc-500">{resource.type}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => complete(resource)} className={"flex-1 rounded-lg border px-3 py-2 text-xs " + (done ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-300" : "border-white/[.07] text-zinc-400 hover:bg-white/[.04]")}>{done ? "Completed" : "Mark complete"}</button>
                            {resource.url !== "#" && <a href={resource.url} target="_blank" rel="noreferrer" className="grid h-8 w-9 place-items-center rounded-lg border border-white/[.07] text-zinc-500 hover:text-white"><ExternalLink size={13} /></a>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-violet-300/10 bg-violet-300/[.025] p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-300"><Sparkles size={17} /></div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[.18em] text-violet-300">The CareerPilot loop</p>
              <h2 className="mt-1 text-lg font-semibold">Learn → prove → update → move forward</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-600">Learning actions update your Career State. Projects create evidence, while progress and XP give the later Portfolio, Resume, Job Matching and Interview engines real signals to work with.</p>
            </div>
            <a href="/skills-gap" className="hidden items-center gap-2 rounded-xl border border-white/[.08] px-4 py-2 text-xs text-zinc-400 hover:text-white sm:flex">Skill map <ArrowRight size={13} /></a>
          </div>
        </section>

        <footer className="border-t border-white/[.06] py-7 text-[10px] text-zinc-700">CareerPilot · Discover. Build. Prove. Move.</footer>
      </div>
    </main>
  );
}

function Loading() {
  return <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-zinc-500">Loading Learning Intelligence...</main>;
}

function EmptyState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-zinc-100">
      <div className="max-w-lg">
        <BookOpen size={22} className="text-cyan-300" />
        <h1 className="mt-5 text-4xl font-semibold">Set a career direction first.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-500">Learning Intelligence needs a target role before it can decide which skills and resources matter.</p>
        <a href="/career-goal" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Set career goal <ArrowRight size={16} /></a>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof Gauge; label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><div className="flex items-center gap-2 text-zinc-600"><Icon size={15} /><span className="text-[10px] uppercase tracking-wider">{label}</span></div><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-zinc-600">{note}</p></div>;
}

function Importance({ value }: { value: "high" | "medium" | "low" }) {
  const styles = { high: "bg-amber-300/10 text-amber-300", medium: "bg-slate-400/10 text-slate-400", low: "bg-zinc-400/10 text-zinc-500" };
  return <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + styles[value]}>{value}</span>;
}
