 "use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Code2,
  ExternalLink,
  Flag,
  FolderKanban,
  Lock,
  Play,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

type Status = "complete" | "current" | "upcoming" | "locked";

const phases = [
  {
    id: "foundation",
    number: "01",
    title: "Foundation",
    subtitle: "Build the core toolkit",
    color: "violet",
    duration: "2–3 weeks",
    progress: 100,
    status: "complete" as Status,
    nodes: [
      { title: "Excel for analysis", type: "Learning", duration: "4h", status: "complete" as Status, detail: "Functions, pivots, cleaning and analysis workflows." },
      { title: "Statistics essentials", type: "Learning", duration: "5h", status: "complete" as Status, detail: "Descriptive statistics, distributions and practical interpretation." },
      { title: "Foundation checkpoint", type: "Assessment", duration: "25 min", status: "complete" as Status, detail: "Validate the concepts before moving into SQL." },
    ],
  },
  {
    id: "sql",
    number: "02",
    title: "SQL & Data Querying",
    subtitle: "Become confident with real datasets",
    color: "cyan",
    duration: "3–4 weeks",
    progress: 58,
    status: "current" as Status,
    nodes: [
      { title: "SQL fundamentals", type: "Learning", duration: "6h", status: "complete" as Status, detail: "SELECT, filtering, sorting, aggregation and joins." },
      { title: "Advanced SQL practice", type: "Practice", duration: "8h", status: "current" as Status, detail: "CTEs, window functions, subqueries and business questions." },
      { title: "SQL skill assessment", type: "Assessment", duration: "35 min", status: "upcoming" as Status, detail: "Prove your ability through timed, role-relevant questions." },
      { title: "SQL business case", type: "Project", duration: "5h", status: "upcoming" as Status, detail: "Analyze a realistic dataset and document the decisions behind your queries." },
    ],
  },
  {
    id: "bi",
    number: "03",
    title: "Visualization & BI",
    subtitle: "Turn analysis into decisions",
    color: "emerald",
    duration: "3–4 weeks",
    progress: 0,
    status: "upcoming" as Status,
    nodes: [
      { title: "Power BI essentials", type: "Learning", duration: "7h", status: "upcoming" as Status, detail: "Data modeling, measures, visuals and dashboard design." },
      { title: "Build an executive dashboard", type: "Project", duration: "8h", status: "upcoming" as Status, detail: "Create a decision-ready dashboard from a messy business dataset." },
      { title: "Dashboard review", type: "Assessment", duration: "30 min", status: "upcoming" as Status, detail: "Evaluate accuracy, storytelling and usability." },
    ],
  },
  {
    id: "portfolio",
    number: "04",
    title: "Portfolio & Proof",
    subtitle: "Convert skills into evidence",
    color: "amber",
    duration: "2–3 weeks",
    progress: 0,
    status: "upcoming" as Status,
    nodes: [
      { title: "Portfolio project #1", type: "Project", duration: "10h", status: "upcoming" as Status, detail: "End-to-end analysis with a clear business narrative." },
      { title: "Portfolio project #2", type: "Project", duration: "10h", status: "upcoming" as Status, detail: "A second project demonstrating a different analytical skill." },
      { title: "Portfolio quality check", type: "Assessment", duration: "20 min", status: "upcoming" as Status, detail: "Check evidence quality, documentation and presentation." },
    ],
  },
  {
    id: "job-ready",
    number: "05",
    title: "Job Ready",
    subtitle: "Package, apply and prepare",
    color: "rose",
    duration: "2–3 weeks",
    progress: 0,
    status: "locked" as Status,
    nodes: [
      { title: "Resume intelligence", type: "Resume", duration: "30 min", status: "locked" as Status, detail: "Align your resume to the target role without inventing experience." },
      { title: "Targeted job matches", type: "Jobs", duration: "Ongoing", status: "locked" as Status, detail: "Discover opportunities based on skills, evidence and preferences." },
      { title: "Interview Arena", type: "Interview", duration: "20 min", status: "locked" as Status, detail: "Practice against realistic role-specific interview scenarios." },
    ],
  },
];

const resources = [
  { title: "SQLBolt", kind: "Interactive SQL", level: "Beginner", time: "3–5h", icon: Code2 },
  { title: "Mode SQL Tutorial", kind: "SQL + analysis", level: "Intermediate", time: "4–6h", icon: BookOpen },
  { title: "Microsoft Learn: Power BI", kind: "BI learning", level: "Beginner", time: "6–8h", icon: BarChart3 },
];

export default function CareerRoadmap() {
  const [expanded, setExpanded] = useState("sql");
  const [completed, setCompleted] = useState<string[]>([
    "Excel for analysis",
    "Statistics essentials",
    "Foundation checkpoint",
    "SQL fundamentals",
  ]);
  const [showResources, setShowResources] = useState(true);

  const overallProgress = useMemo(() => {
    const total = phases.reduce((sum, phase) => sum + phase.nodes.length, 0);
    return Math.round((completed.length / total) * 100);
  }, [completed]);

  const currentNode = phases.flatMap((phase) => phase.nodes).find((node) => node.status === "current");

  function toggleComplete(title: string) {
    setCompleted((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title]
    );
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[35%] h-[480px] w-[480px] rounded-full bg-cyan-500/[.05] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <div className="flex items-center gap-3">
            <a href="/career-discovery" className="rounded-xl border border-white/[.07] p-2 text-zinc-500 hover:text-white">
              <ArrowLeft size={17} />
            </a>
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-zinc-600">CareerPilot</p>
              <h1 className="mt-1 text-lg font-semibold">Career Roadmap</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-zinc-600 sm:flex">
            <Rocket size={14} className="text-violet-400" /> Data Analyst pathway
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-7 sm:flex-row">
              <div>
                <div className="flex items-center gap-2 text-xs text-violet-300"><Target size={15} /> Active career goal</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Data Analyst</h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
                  A personalized path from your current profile to demonstrable, job-ready evidence.
                </p>
              </div>
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[.06]">
                <span className="text-xl font-semibold">{overallProgress}%</span>
                <span className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">complete</span>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              <Metric icon={Target} label="Target" value="Data Analyst" />
              <Metric icon={Clock3} label="Estimated" value="12–16 weeks" />
              <Metric icon={Zap} label="Current pace" value="On track" />
              <Metric icon={Trophy} label="XP earned" value="1,240 XP" />
            </div>
          </div>

          <aside className="rounded-3xl border border-violet-400/15 bg-violet-400/[.045] p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
              <Sparkles size={15} /> Next Best Action
            </div>
            <h3 className="mt-4 text-lg font-semibold">Finish advanced SQL practice</h3>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              You are 58% through the SQL phase. Completing this unlocks your role-specific SQL assessment.
            </p>
            <div className="mt-5 rounded-2xl border border-white/[.06] bg-black/15 p-4">
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>SQL phase</span><span>58%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[.06]">
                <div className="h-full w-[58%] rounded-full bg-cyan-400" />
              </div>
            </div>
            <button
              onClick={() => setExpanded("sql")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-semibold text-black"
            >
              Continue mission <ArrowRight size={14} />
            </button>
          </aside>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-zinc-700">Your journey</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">From foundations to job-ready</h2>
            </div>
            <p className="hidden text-xs text-zinc-700 sm:block">{completed.length} milestones completed</p>
          </div>

          <div className="mt-5 space-y-3">
            {phases.map((phase) => {
              const isExpanded = expanded === phase.id;
              return (
                <section key={phase.id} className={`overflow-hidden rounded-3xl border ${phase.status === "current" ? "border-cyan-400/15 bg-cyan-400/[.025]" : "border-white/[.06] bg-white/[.018]"}`}>
                  <button onClick={() => phase.status !== "locked" && setExpanded(isExpanded ? "" : phase.id)} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${phase.status === "complete" ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-300" : phase.status === "current" ? "border-cyan-400/20 bg-cyan-400/[.07] text-cyan-300" : phase.status === "locked" ? "border-white/[.05] text-zinc-700" : "border-white/[.07] text-zinc-500"}`}>
                      {phase.status === "complete" ? <Check size={18} /> : phase.status === "locked" ? <Lock size={16} /> : <span className="text-xs font-semibold">{phase.number}</span>}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{phase.title}</h3>
                        {phase.status === "current" && <span className="rounded-full border border-cyan-400/15 bg-cyan-400/[.06] px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-300">Current</span>}
                        {phase.status === "complete" && <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[.06] px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300">Complete</span>}
                        {phase.status === "locked" && <span className="rounded-full border border-white/[.05] px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-700">Locked</span>}
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">{phase.subtitle}</p>
                    </div>

                    <div className="hidden w-36 sm:block">
                      <div className="flex justify-between text-[9px] text-zinc-700"><span>{phase.progress}%</span><span>{phase.duration}</span></div>
                      <div className="mt-2 h-1 rounded-full bg-white/[.05]">
                        <div className={`h-full rounded-full ${phase.status === "complete" ? "bg-emerald-400" : phase.status === "current" ? "bg-cyan-400" : "bg-zinc-700"}`} style={{ width: `${phase.progress}%` }} />
                      </div>
                    </div>

                    {phase.status !== "locked" && <ChevronDown size={17} className={`text-zinc-700 transition ${isExpanded ? "rotate-180" : ""}`} />}
                  </button>

                  {isExpanded && phase.status !== "locked" && (
                    <div className="border-t border-white/[.06] px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                      <div className="space-y-2">
                        {phase.nodes.map((node, index) => {
                          const done = completed.includes(node.title);
                          const isCurrent = node.status === "current";
                          const locked = node.status === "locked";
                          return (
                            <div key={node.title} className={`group rounded-2xl border p-4 transition ${isCurrent ? "border-cyan-400/15 bg-cyan-400/[.035]" : "border-white/[.05] bg-black/10"}`}>
                              <div className="flex items-start gap-3">
                                <button
                                  disabled={locked}
                                  onClick={() => toggleComplete(node.title)}
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${done ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : isCurrent ? "border-cyan-400/30 text-cyan-300" : "border-white/[.09] text-zinc-700"}`}
                                >
                                  {done ? <Check size={13} /> : locked ? <Lock size={11} /> : <Circle size={11} />}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className={`text-sm font-medium ${done ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-300"}`}>{node.title}</h4>
                                    <span className="rounded-md border border-white/[.05] px-1.5 py-0.5 text-[9px] text-zinc-600">{node.type}</span>
                                  </div>
                                  <p className="mt-1 text-[11px] leading-5 text-zinc-600">{node.detail}</p>
                                  <div className="mt-3 flex items-center gap-3 text-[9px] text-zinc-700">
                                    <span className="flex items-center gap-1"><Clock3 size={11} /> {node.duration}</span>
                                    {isCurrent && <span className="flex items-center gap-1 text-cyan-400"><Play size={10} /> Recommended next</span>}
                                  </div>
                                </div>
                                {!done && !locked && (
                                  <button onClick={() => toggleComplete(node.title)} className="hidden rounded-lg border border-white/[.07] px-2.5 py-2 text-[10px] text-zinc-600 hover:text-zinc-300 sm:block">
                                    Mark complete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl border border-white/[.06] bg-white/[.018] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-zinc-700">Evidence layer</p>
                <h3 className="mt-2 text-lg font-semibold">Your roadmap builds proof, not just completion ticks.</h3>
              </div>
              <FolderKanban size={18} className="text-zinc-700" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Evidence icon={Award} title="Skills" value="4 verified" />
              <Evidence icon={FolderKanban} title="Projects" value="1 started" />
              <Evidence icon={Flag} title="Assessments" value="1 passed" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/[.06] bg-white/[.018] p-6">
            <button onClick={() => setShowResources(!showResources)} className="flex w-full items-center justify-between text-left">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-zinc-700">Free learning</p>
                <h3 className="mt-2 text-lg font-semibold">Recommended resources</h3>
              </div>
              <ChevronDown size={17} className={`text-zinc-700 transition ${showResources ? "rotate-180" : ""}`} />
            </button>
            {showResources && (
              <div className="mt-4 space-y-2">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <div key={resource.title} className="flex items-center gap-3 rounded-xl border border-white/[.05] bg-black/10 p-3">
                      <Icon size={15} className="text-violet-300" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-300">{resource.title}</p>
                        <p className="mt-0.5 text-[9px] text-zinc-700">{resource.kind} · {resource.level} · {resource.time}</p>
                      </div>
                      <ExternalLink size={12} className="text-zinc-700" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="mt-7 flex items-center justify-between">
          <a href="/career-discovery" className="text-xs text-zinc-600 hover:text-zinc-300">← Back to Career Discovery</a>
          <a href="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-white">Command center <ArrowRight size={13} /></a>
        </div>

        <footer className="py-8 text-center text-[10px] text-zinc-700">CareerPilot · Learn it. Prove it. Use it.</footer>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><Icon size={14} className="text-zinc-700" /><p className="mt-3 text-[9px] uppercase tracking-wider text-zinc-700">{label}</p><p className="mt-1 text-xs text-zinc-400">{value}</p></div>;
}

function Evidence({ icon: Icon, title, value }: { icon: typeof Award; title: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><Icon size={15} className="text-emerald-300" /><p className="mt-3 text-[10px] text-zinc-700">{title}</p><p className="mt-1 text-sm font-medium text-zinc-300">{value}</p></div>;
}
