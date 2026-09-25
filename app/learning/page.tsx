 "use client";

import { useMemo, useState } from "react";

type Resource = {
  title: string;
  provider: string;
  type: "Course" | "Practice" | "Project" | "Documentation";
  level: "Beginner" | "Intermediate";
  free: boolean;
  duration: string;
  url: string;
};

type SkillPath = {
  skill: string;
  gap: number;
  priority: "Critical" | "High" | "Medium";
  progress: number;
  eta: string;
  resources: Resource[];
};

const paths: SkillPath[] = [
  {
    skill: "Power BI",
    gap: 55,
    priority: "Critical",
    progress: 20,
    eta: "10–14 days",
    resources: [
      { title: "Power BI fundamentals", provider: "Microsoft Learn", type: "Course", level: "Beginner", free: true, duration: "4h", url: "#" },
      { title: "Clean and transform data", provider: "Microsoft Learn", type: "Practice", level: "Beginner", free: true, duration: "2h", url: "#" },
      { title: "Build an executive dashboard", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", free: true, duration: "6h", url: "#" },
    ],
  },
  {
    skill: "Python",
    gap: 30,
    priority: "High",
    progress: 50,
    eta: "7–10 days",
    resources: [
      { title: "Python basics", provider: "freeCodeCamp", type: "Course", level: "Beginner", free: true, duration: "5h", url: "#" },
      { title: "Python data analysis practice", provider: "Kaggle Learn", type: "Practice", level: "Beginner", free: true, duration: "3h", url: "#" },
      { title: "Exploratory analysis project", provider: "CareerPilot Project Lab", type: "Project", level: "Intermediate", free: true, duration: "5h", url: "#" },
    ],
  },
  {
    skill: "Statistics",
    gap: 20,
    priority: "Medium",
    progress: 60,
    eta: "5–7 days",
    resources: [
      { title: "Statistics foundations", provider: "Khan Academy", type: "Course", level: "Beginner", free: true, duration: "4h", url: "#" },
      { title: "Statistics practice set", provider: "CareerPilot Assessments", type: "Practice", level: "Beginner", free: true, duration: "90m", url: "#" },
    ],
  },
];

const filters = ["All", "Critical", "High", "Medium"] as const;

export default function LearningIntelligencePage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedSkill, setSelectedSkill] = useState("Power BI");
  const [completed, setCompleted] = useState<string[]>([]);

  const visiblePaths = useMemo(
    () => paths.filter((p) => filter === "All" || p.priority === filter),
    [filter]
  );

  const selected = paths.find((p) => p.skill === selectedSkill) ?? paths[0];
  const completedCount = completed.length;
  const totalResources = paths.reduce((sum, p) => sum + p.resources.length, 0);

  function toggleComplete(title: string) {
    setCompleted((current) =>
      current.includes(title) ? current.filter((x) => x !== title) : [...current, title]
    );
  }

  return (
    <main className="min-h-screen bg-[#071018] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-cyan-300">
              <span>CareerPilot</span><span className="text-slate-600">/</span><span>Learning Intelligence</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Turn skill gaps into a learning path.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              CareerPilot maps each missing skill to free learning, practice, projects and assessment evidence.
              No random course hunting. Every resource has a job.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Target role</div>
            <div className="mt-1 font-medium">Data Analyst</div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["68%", "Career readiness", "↑ 12% this cycle"],
            ["3", "Active skill paths", "1 critical gap"],
            [String(totalResources), "Mapped resources", "All currently free"],
            [String(completedCount), "Completed actions", "Keep the chain moving"],
          ].map(([value, label, note]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="text-2xl font-semibold">{value}</div>
              <div className="mt-1 text-sm text-slate-300">{label}</div>
              <div className="mt-2 text-xs text-cyan-300">{note}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your skill learning queue</h2>
                <p className="mt-1 text-sm text-slate-500">Prioritized from your current skill gaps.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      filter === item ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {visiblePaths.map((path) => (
                <button
                  key={path.skill}
                  onClick={() => setSelectedSkill(path.skill)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedSkill === path.skill
                      ? "border-cyan-300/40 bg-cyan-300/[0.07]"
                      : "border-white/10 bg-black/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{path.skill}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                          path.priority === "Critical" ? "bg-rose-400/10 text-rose-300" :
                          path.priority === "High" ? "bg-amber-400/10 text-amber-300" :
                          "bg-slate-400/10 text-slate-300"
                        }`}>{path.priority}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{path.eta} estimated to close the gap</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{path.progress}%</div>
                      <div className="text-[11px] text-slate-500">current level</div>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${path.progress}%` }} />
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                    <span>Current {path.progress}%</span>
                    <span>Target 75%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.045] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">Next Best Learning Action</div>
            <h2 className="mt-3 text-2xl font-semibold">Start {selected.skill} fundamentals</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              This is the highest-impact learning step for your current {selected.skill.toLowerCase()} gap.
              Completing it moves both your roadmap and skill evidence forward.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Recommended sequence</span>
                <span className="text-xs text-slate-500">{selected.resources.length} steps</span>
              </div>
              <div className="mt-4 space-y-3">
                {selected.resources.map((resource, index) => (
                  <div key={resource.title} className="flex gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs text-cyan-300">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm">{resource.title}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{resource.type} · {resource.duration} · {resource.provider}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => toggleComplete(selected.resources[0].title)}
              className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
            >
              {completed.includes(selected.resources[0].title) ? "✓ Fundamentals completed" : "Start first learning action"}
            </button>
          </aside>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selected.skill} resource map</h2>
              <p className="mt-1 text-sm text-slate-500">Every item is connected to the same career goal.</p>
            </div>
            <span className="text-xs text-cyan-300">Free-first learning</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {selected.resources.map((resource) => (
              <div key={resource.title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">{resource.type}</span>
                  <span className="text-[10px] text-emerald-300">FREE</span>
                </div>
                <h3 className="mt-4 font-medium">{resource.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{resource.provider}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{resource.level}</span><span>{resource.duration}</span>
                </div>
                <button
                  onClick={() => toggleComplete(resource.title)}
                  className={`mt-4 w-full rounded-xl border px-3 py-2 text-xs ${
                    completed.includes(resource.title)
                      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {completed.includes(resource.title) ? "✓ Completed" : "Mark complete"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Learning completion will later feed Skill Verification, Portfolio Evidence and Resume Intelligence.</span>
          <span className="text-cyan-300">Career State stays connected →</span>
        </div>
      </div>
    </main>
  );
}
