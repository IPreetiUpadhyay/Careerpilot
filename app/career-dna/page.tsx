 "use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Edit3,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  Target,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";

type Pill = { label: string; tone: string };

const initialSkills: Pill[] = [
  { label: "SQL", tone: "violet" },
  { label: "Excel", tone: "cyan" },
  { label: "Python", tone: "emerald" },
  { label: "Power BI", tone: "amber" },
];

const goals = [
  ["Primary target", "Data Analyst"],
  ["Work preference", "Hybrid / Remote"],
  ["Experience", "Early career"],
  ["Geography", "India + International"],
];

const evidence = [
  ["Education", "BCA · Amity University", "Verified"],
  ["Experience", "Early-career profile", "Profile"],
  ["Skills", "4 core skills added", "Partial"],
];

export default function CareerDNA() {
  const [skills, setSkills] = useState(initialSkills);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("Power BI");

  const completeness = useMemo(() => {
    const base = 68;
    return Math.min(100, base + Math.max(0, skills.length - 4) * 4);
  }, [skills.length]);

  function addSkill() {
    const value = draft.trim();
    if (!value || skills.some((s) => s.label.toLowerCase() === value.toLowerCase())) return;
    setSkills([...skills, { label: value, tone: "violet" }]);
    setDraft("");
    setEditing(false);
  }

  function removeSkill(label: string) {
    setSkills(skills.filter((skill) => skill.label !== label));
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-18%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-10%] top-[28%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="rounded-xl border border-white/[.07] p-2 text-zinc-500 hover:text-white">
              <ArrowLeft size={17} />
            </a>
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-zinc-600">CareerPilot</p>
              <h1 className="mt-1 text-lg font-semibold">Career DNA</h1>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.03] px-3.5 py-2 text-xs text-zinc-300 hover:bg-white/[.06]">
            <Edit3 size={14} /> Edit profile
          </button>
        </header>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[.12] via-white/[.035] to-cyan-400/[.05] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                <Sparkles size={15} /> Your professional identity
              </div>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
                A living profile of where you are, where you want to go, and what proves you can get there.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                CareerPilot uses your Career DNA as the shared foundation for roadmaps, skill gaps, job matching, resumes, projects and interview preparation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[.07] bg-black/15 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Profile signal</span>
                <span className="text-lg font-semibold">{completeness}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-600">Complete your evidence to make recommendations more precise.</p>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Identity</p>
                <h2 className="mt-1 text-xl font-semibold">Professional snapshot</h2>
              </div>
              <UserRound size={18} className="text-zinc-700" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info icon={UserRound} label="Career stage" value="Skill Builder" />
              <Info icon={GraduationCap} label="Education" value="BCA · Amity University" />
              <Info icon={BriefcaseBusiness} label="Target role" value="Data Analyst" />
              <Info icon={MapPin} label="Opportunity scope" value="India + International" />
            </div>

            <div className="mt-7 border-t border-white/[.06] pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-300">Core skills</p>
                  <p className="mt-1 text-xs text-zinc-600">What you can currently demonstrate or are building.</p>
                </div>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-violet-300">
                  <Plus size={13} /> Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill.label} className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${skill.tone === "cyan" ? "border-cyan-400/15 bg-cyan-400/[.06] text-cyan-200" : skill.tone === "emerald" ? "border-emerald-400/15 bg-emerald-400/[.06] text-emerald-200" : skill.tone === "amber" ? "border-amber-400/15 bg-amber-400/[.06] text-amber-200" : "border-violet-400/15 bg-violet-400/[.06] text-violet-200"}`}>
                    {skill.label}
                    <button onClick={() => removeSkill(skill.label)} className="hidden text-current/50 group-hover:block"><X size={12} /></button>
                  </span>
                ))}
              </div>

              {editing && (
                <div className="mt-4 flex gap-2">
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="e.g. Tableau" className="min-w-0 flex-1 rounded-xl border border-white/[.08] bg-black/20 px-3 py-2.5 text-xs outline-none placeholder:text-zinc-700 focus:border-violet-400/30" />
                  <button onClick={addSkill} className="rounded-xl bg-white px-4 text-xs font-semibold text-black">Add skill</button>
                  <button onClick={() => setEditing(false)} className="rounded-xl border border-white/[.08] px-3 text-zinc-500"><X size={15} /></button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Career intent</p>
            <h2 className="mt-1 text-xl font-semibold">What you are optimizing for</h2>

            <div className="mt-6 space-y-3">
              {goals.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/[.05] bg-black/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-700">{label}</p>
                  <p className="mt-2 text-sm font-medium text-zinc-300">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[.04] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-200"><Target size={14} /> Current direction</div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Build job-ready analytics evidence, then expand into stronger business intelligence roles.</p>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Evidence layer</p>
              <h2 className="mt-1 text-xl font-semibold">How CareerPilot knows</h2>
              <p className="mt-2 text-xs text-zinc-600">Self-reported information is kept separate from verified evidence.</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white">View evidence <ChevronRight size={14} /></button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {evidence.map(([label, value, status]) => (
              <div key={label} className="rounded-2xl border border-white/[.05] bg-black/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className={`rounded-full px-2 py-1 text-[9px] ${status === "Verified" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[.05] text-zinc-500"}`}>{status}</span>
                </div>
                <p className="mt-4 text-sm text-zinc-300">{value}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-700">
                  {status === "Verified" ? <Check size={12} className="text-emerald-400" /> : <CircleHelp size={12} />}
                  Evidence status
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-violet-400/10 bg-violet-400/[.04] p-6">
            <div className="flex items-center gap-2 text-violet-200"><WandSparkles size={16} /><span className="text-sm font-medium">CareerPilot insight</span></div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">Your profile has a clear target, but the strongest next signal is practical proof. Projects and verified skills will make the rest of CareerPilot more useful.</p>
            <a href="/dashboard" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white">See next actions <ArrowUpRight size={14} /></a>
          </div>

          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <div className="flex items-center gap-2 text-zinc-300"><Compass size={16} /><span className="text-sm font-medium">Connected systems</span></div>
            <p className="mt-4 text-xs leading-5 text-zinc-600">Career DNA will become the shared data layer for your roadmap, learning plan, projects, resume, jobs and interview practice.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Roadmap", "Skills", "Projects", "Resume", "Jobs", "Interview"].map((item) => <span key={item} className="rounded-lg border border-white/[.06] px-2.5 py-1.5 text-[10px] text-zinc-600">{item}</span>)}
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-[10px] text-zinc-700">CareerPilot · Career DNA is the foundation layer.</footer>
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-700"><Icon size={12} />{label}</div>
      <p className="mt-3 text-sm font-medium text-zinc-300">{value}</p>
    </div>
  );
}
