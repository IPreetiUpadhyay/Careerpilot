"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Flame,
  FolderKanban,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const nav = [
  ["Overview", LayoutDashboard],
  ["Career DNA", BrainCircuit],
  ["Roadmap", Compass],
  ["Skills", Gauge],
  ["Learning", BookOpen],
  ["Projects", FolderKanban],
  ["Resume", FileText],
  ["Jobs", BriefcaseBusiness],
  ["Applications", CheckCircle2],
  ["Interview Arena", MessageCircle],
] as const;

const skills = [
  ["SQL", 72, "bg-violet-400"],
  ["Excel", 88, "bg-cyan-400"],
  ["Power BI", 46, "bg-amber-300"],
  ["Python", 64, "bg-emerald-400"],
];

const jobs = [
  ["Data Analyst", "Fintech company", "Noida · Hybrid", 94],
  ["Business Analyst", "Global consulting", "Delhi · On-site", 88],
  ["Junior Data Analyst", "SaaS company", "Remote · India", 86],
];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[18%] top-[-12%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.07] blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/[.07] bg-[#0a0b10]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-full flex-col px-4 py-5">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black"><Zap size={18} fill="currentColor" /></div>
                <div><div className="text-[15px] font-semibold">CareerPilot</div><div className="text-[10px] uppercase tracking-[.18em] text-zinc-600">Career OS</div></div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="lg:hidden text-zinc-500"><X size={18} /></button>
            </div>

            <nav className="mt-8 space-y-1">
              {nav.map(([label, Icon], i) => (
                <button key={label} onClick={() => { setActive(label); setMobileOpen(false); }} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === label ? "bg-white/[.08] text-white" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200"}`}>
                  <Icon size={17} className={active === label ? "text-violet-300" : "text-zinc-600"} />
                  <span>{label}</span>
                  {label === "Jobs" && <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">12</span>}
                </button>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="mb-4 rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/10 to-cyan-400/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200"><Sparkles size={14} /> CareerPilot AI</div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">Ask me about your next career move.</p>
                <button className="mt-3 text-xs text-zinc-300">Open mentor <ArrowUpRight className="inline" size={13} /></button>
              </div>
              <div className="flex items-center gap-3 rounded-xl p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-300 text-xs font-bold text-black">P</div>
                <div><p className="text-sm font-medium">Explorer</p><p className="text-[11px] text-zinc-600">Level 4 · 1,240 XP</p></div>
              </div>
            </div>
          </div>
        </aside>

        {mobileOpen && <button onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close menu" />}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-white/[.07] bg-[#08090d]/80 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-white/[.08] p-2 text-zinc-400 lg:hidden"><Menu size={18} /></button>
              <div className="relative hidden sm:block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input placeholder="Search CareerPilot..." className="h-9 w-64 rounded-xl border border-white/[.07] bg-white/[.025] pl-9 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-700" /></div>
              <span className="text-sm text-zinc-600 sm:hidden">{active}</span>
            </div>
            <div className="flex items-center gap-1"><button className="relative p-2.5 text-zinc-500"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" /></button><button className="p-2.5 text-zinc-500"><Settings size={18} /></button><div className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[.06] text-xs sm:flex">P</div></div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="text-xs font-medium uppercase tracking-[.18em] text-violet-300">Friday, September 25</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Good morning, Explorer.</h1><p className="mt-2 text-sm text-zinc-500">Your career has momentum. Here&apos;s what matters today.</p></div>
              <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-xl border border-orange-400/10 bg-orange-400/[.05] px-3 py-2 text-xs text-orange-200"><Flame size={15} /> 7 day streak</div><button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black"><Plus size={15} /> Quick action</button></div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.45fr_.8fr_.8fr]">
              <div className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.12] via-white/[.035] to-cyan-400/[.05] p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200"><Target size={15} /> Next best action</div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-[28px]">Complete your SQL assessment</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">SQL is your largest unverified skill for the Data Analyst path. Completing this assessment can strengthen your Career DNA and unlock the next roadmap step.</p>
                <div className="mt-6 flex flex-wrap items-center gap-3"><button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black">Start assessment <ChevronRight size={15} /></button><span className="text-xs text-zinc-600">~12 min · +120 XP</span></div>
              </div>
              <Stat label="Career readiness" value="68%" detail="+8% this month" icon={TrendingUp} />
              <Stat label="Current level" value="4" detail="1,240 / 1,500 XP" icon={Trophy} progress={83} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-zinc-600">Career DNA</p><h2 className="mt-1 text-lg font-semibold">Data Analyst</h2></div><button className="text-xs text-zinc-500">View profile <ChevronRight className="inline" size={14} /></button></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2"><Metric icon={Compass} label="Target role" value="Data Analyst" /><Metric icon={Globe2} label="Preferred work" value="Hybrid / Remote" /><Metric icon={BriefcaseBusiness} label="Experience" value="Early career" /><Metric icon={UserRound} label="Career stage" value="Skill Builder" /></div>
                <div className="mt-6 rounded-2xl border border-white/[.06] bg-black/10 p-4"><div className="flex justify-between text-xs"><span className="text-zinc-400">Profile completeness</span><b>76%</b></div><div className="mt-3 h-1.5 rounded-full bg-white/[.06]"><div className="h-full w-[76%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" /></div><p className="mt-3 text-xs text-zinc-600">Add 2 projects and verify 1 more skill to strengthen your profile.</p></div>
              </section>

              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-zinc-600">Skill signal</p><h2 className="mt-1 text-lg font-semibold">Your core skills</h2></div><button className="text-xs text-zinc-500">Skill tree</button></div>
                <div className="mt-6 space-y-5">{skills.map(([name, level, color]) => <div key={name}><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-300">{name}</span><span className="text-zinc-600">{level}%</span></div><div className="h-1.5 rounded-full bg-white/[.06]"><div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} /></div></div>)}</div>
              </section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-zinc-600">Opportunity intelligence</p><h2 className="mt-1 text-lg font-semibold">Jobs matching your Career DNA</h2></div><button className="text-xs text-zinc-500">Explore all <ArrowUpRight className="inline" size={13} /></button></div>
                <div className="mt-5 space-y-2">{jobs.map(([role, company, location, match]) => <div key={role} className="flex items-center gap-4 rounded-2xl border border-white/[.05] bg-black/10 p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.06]"><BriefcaseBusiness size={18} className="text-zinc-400" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{role}</p><p className="mt-1 truncate text-xs text-zinc-600">{company} · {location}</p></div><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-emerald-300">{match}%</p><p className="text-[10px] uppercase tracking-wider text-zinc-700">match</p></div><ChevronRight size={16} className="text-zinc-700" /></div>)}</div>
              </section>

              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-zinc-600">Roadmap</p><h2 className="mt-1 text-lg font-semibold">Data Analyst path</h2></div><span className="text-xs text-violet-300">5 / 8</span></div>
                <div className="mt-6">{[["Career direction",true],["SQL foundations",true],["Excel proficiency",true],["Power BI",false],["Portfolio project",false],["Resume alignment",false]].map(([label,done],i)=><div key={String(label)} className="flex items-center gap-3"><div className="flex w-5 flex-col items-center"><div className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-zinc-700"}`}>{done ? <CheckCircle2 size={12}/> : <span className="h-1.5 w-1.5 rounded-full bg-current"/>}</div>{i<5&&<div className={`h-7 w-px ${done?"bg-emerald-400/20":"bg-white/[.07]"}`}/>}</div><span className={`text-xs ${done?"text-zinc-400":"text-zinc-600"}`}>{label}</span></div>)}</div>
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.07] py-2.5 text-xs text-zinc-400">Continue roadmap <ArrowUpRight size={13}/></button>
              </section>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3"><Action icon={FileText} title="Improve your resume" text="3 role-alignment suggestions are waiting."/><Action icon={FolderKanban} title="Build a portfolio project" text="A Power BI project is recommended next."/><Action icon={MessageCircle} title="Practice an interview" text="Try a 10-minute Data Analyst mock."/></div>
            <footer className="mt-8 flex justify-between border-t border-white/[.06] py-6 text-[11px] text-zinc-700"><span>CareerPilot · Discover. Build. Prove. Move.</span><span className="hidden sm:block">AI recommendations are decision support, not guarantees.</span></footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value, detail, progress }: { icon: typeof TrendingUp; label: string; value: string; detail: string; progress?: number }) {
  return <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6"><div className="flex justify-between"><span className="text-xs text-zinc-600">{label}</span><Icon size={16} className="text-zinc-600"/></div><div className="mt-5 text-4xl font-semibold">{value}</div><p className="mt-2 text-xs text-emerald-300/80">{detail}</p>{progress&&<div className="mt-5 h-1.5 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-violet-400" style={{width:`${progress}%`}}/></div>}</div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Compass; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-3.5"><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-700"><Icon size={12}/>{label}</div><p className="mt-2 text-xs font-medium text-zinc-300">{value}</p></div>;
}

function Action({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
  return <button className="group rounded-2xl border border-white/[.07] bg-white/[.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/[.12]"><div className="flex justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.06]"><Icon size={16} className="text-zinc-400"/></div><ArrowUpRight size={15} className="text-zinc-700"/></div><h3 className="mt-4 text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-zinc-600">{text}</p></button>;
}
