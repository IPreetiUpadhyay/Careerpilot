"use client";

import { useMemo, useState } from "react";

type Skill = {
  name: string;
  current: number;
  required: number;
  evidence: string;
  category: string;
  priority: "Critical" | "High" | "Medium";
  action: string;
};

const skills: Skill[] = [
  { name: "SQL", current: 90, required: 85, evidence: "Assessment + project", category: "Core", priority: "Medium", action: "Take an advanced SQL challenge" },
  { name: "Excel", current: 80, required: 75, evidence: "Self-assessment", category: "Core", priority: "Medium", action: "Add a spreadsheet project" },
  { name: "Python", current: 52, required: 70, evidence: "Self-assessment", category: "Technical", priority: "High", action: "Complete Python data analysis challenge" },
  { name: "Power BI", current: 22, required: 75, evidence: "No practical evidence", category: "Technical", priority: "Critical", action: "Learn Power BI fundamentals" },
  { name: "Statistics", current: 61, required: 70, evidence: "Course completion", category: "Core", priority: "High", action: "Complete statistics assessment" },
  { name: "Data Visualization", current: 44, required: 70, evidence: "1 project", category: "Portfolio", priority: "High", action: "Build a dashboard project" },
  { name: "Communication", current: 68, required: 65, evidence: "Profile evidence", category: "Professional", priority: "Medium", action: "Practice interview responses" },
  { name: "Problem Solving", current: 63, required: 70, evidence: "Assessment", category: "Professional", priority: "High", action: "Complete a case challenge" },
];

const filters = ["All", "Critical", "High", "Medium"] as const;

export default function SkillsGapPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Skill>(skills[3]);
  const [completed, setCompleted] = useState<string[]>([]);

  const filteredSkills = useMemo(
    () => filter === "All" ? skills : skills.filter((skill) => skill.priority === filter),
    [filter]
  );

  const gapSkills = skills.filter((skill) => skill.current < skill.required);
  const averageReadiness = Math.round(skills.reduce((sum, skill) => sum + Math.min(skill.current / skill.required, 1), 0) / skills.length * 100);
  const criticalCount = skills.filter((skill) => skill.priority === "Critical").length;

  const markComplete = () => {
    if (!completed.includes(selected.name)) setCompleted([...completed, selected.name]);
  };

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-300">Skills Intelligence</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your skill gaps, turned into a plan.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">CareerPilot compares your current evidence against the skills your target role requires, then prioritizes what to do next.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="text-xs text-slate-400">Target career</div>
            <div className="mt-1 flex items-center gap-2 font-medium">Data Analyst <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-300">Active</span></div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Career readiness" value={`${averageReadiness}%`} sub="Across required skills" />
          <Stat label="Priority gaps" value={`${gapSkills.length}`} sub={`${criticalCount} critical gap`} />
          <Stat label="Verified evidence" value="4 / 8" sub="Skills with supporting proof" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Skill gap map</h2>
                <p className="mt-1 text-sm text-slate-400">Current capability vs. target-role requirement</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === item ? "bg-white text-slate-900" : "border border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]"}`}>{item}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSkills.map((skill) => {
                const gap = Math.max(skill.required - skill.current, 0);
                const done = completed.includes(skill.name);
                return (
                  <button key={skill.name} onClick={() => setSelected(skill)} className={`w-full rounded-2xl border p-4 text-left transition ${selected.name === skill.name ? "border-cyan-400/40 bg-cyan-400/[0.06]" : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <Priority priority={skill.priority} />
                          {done && <span className="text-xs text-emerald-300">✓ Action complete</span>}
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-cyan-300" style={{ width: `${skill.current}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>Current {skill.current}%</span><span>Required {skill.required}%</span></div>
                      </div>
                      <div className="hidden text-right sm:block"><div className="text-lg font-semibold">{gap > 0 ? `-${gap}%` : "Ready"}</div><div className="text-[11px] text-slate-500">gap</div></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[0.08] to-white/[0.025] p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Next best action</p><h2 className="mt-2 text-2xl font-semibold">{selected.name}</h2></div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{selected.priority}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{selected.name} is currently at <strong className="text-white">{selected.current}%</strong>, while CareerPilot estimates <strong className="text-white">{selected.required}%</strong> is needed for your target role.</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs text-slate-500">Why this matters</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selected.evidence === "No practical evidence" ? "You may know the concept, but there is not enough practical proof yet. A real project can strengthen both your skill evidence and portfolio." : `Your evidence is currently ${selected.evidence.toLowerCase()}. Strengthening this skill can close the remaining gap.`}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs text-slate-500">Recommended action</div>
              <p className="mt-2 font-medium">{selected.action}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>Estimated effort</span><span className="text-slate-300">2–4 hours</span></div>
            </div>

            <button onClick={markComplete} className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50">{completed.includes(selected.name) ? "Action recorded ✓" : "Start this action"}</button>
            <p className="mt-3 text-center text-xs text-slate-500">Completing actions updates your roadmap, evidence and readiness.</p>
          </aside>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div><h2 className="text-lg font-semibold">Evidence coverage</h2><p className="mt-1 text-sm text-slate-400">CareerPilot separates what you say you know from what you can prove.</p></div>
            <span className="text-sm text-slate-500">4 of 8 skills have supporting evidence</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Evidence title="Assessment" value="2 skills" />
            <Evidence title="Projects" value="2 skills" />
            <Evidence title="Courses" value="1 skill" />
            <Evidence title="Work evidence" value="0 skills" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div><div className="mt-1 text-xs text-slate-500">{sub}</div></div>;
}

function Priority({ priority }: { priority: Skill["priority"] }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priority === "Critical" ? "bg-rose-400/10 text-rose-300" : priority === "High" ? "bg-amber-300/10 text-amber-300" : "bg-slate-400/10 text-slate-400"}`}>{priority}</span>;
}

function Evidence({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="text-sm font-medium">{title}</div><div className="mt-1 text-xs text-slate-500">{value}</div></div>;
}
