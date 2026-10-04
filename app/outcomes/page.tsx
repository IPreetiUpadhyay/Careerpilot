"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, FileText, Globe2, Sparkles, Target, TrendingUp } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";
import { calculateCareerReadiness } from "../lib/career-intelligence";

export default function OutcomesPage() {
  const [state, setState] = useState<CareerState | null>(null); const [server,setServer]=useState<any>(null);

  useEffect(() => {
    const refresh = () => setState(loadCareerState());
    refresh(); fetch("/api/outcomes").then(x=>x.json()).then(setServer).catch(()=>{});
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const metrics = useMemo(() => {
    if (!state) return null;
    const applications = state.applications;
    const interviews = state.interviews;
    const offers = server?.offers ?? applications.filter(a => a.stage === "offer").length;
    const rejected = applications.filter(a => a.stage === "rejected").length;
    const active = applications.filter(a => !["rejected", "withdrawn", "offer"].includes(a.stage)).length;
    const interviewCount = server?.interviews ?? interviews.length; const interviewRate = applications.length ? Math.round((interviewCount / applications.length) * 100) : 0;
    const offerRate = applications.length ? Math.round((offers / applications.length) * 100) : 0;
    const readiness = calculateCareerReadiness(state);
    return { applications, interviews, offers, rejected, active, interviewRate, offerRate, readiness };
  }, [state]);

  if (!state || !metrics) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading Career Outcomes...</main>;

  const stageCounts = [
    ["Saved", state.applications.filter(a => a.stage === "saved").length],
    ["Applied", state.applications.filter(a => a.stage === "applied").length],
    ["Screening", state.applications.filter(a => a.stage === "screening").length],
    ["Interview", state.applications.filter(a => a.stage === "interview").length],
    ["Offer", metrics.offers],
  ];

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Career Outcomes</span>
        </header>

        <section className="py-9">
          <div className="flex items-center gap-2 text-xs text-violet-300"><TrendingUp size={15}/> Evidence & outcomes</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">See what your career activity is producing.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">CareerPilot turns your applications, interviews, projects and readiness signals into a personal career activity record. These are descriptive measurements, not predictions.</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={FileText} label="Applications" value={String(metrics.applications.length)} />
          <Metric icon={Clock3} label="Active pipeline" value={String(metrics.active)} />
          <Metric icon={Target} label="Interviews" value={String(server?.interviews ?? metrics.interviews.length)} />
          <Metric icon={CheckCircle2} label="Offers recorded" value={String(server?.offers ?? metrics.offers)} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <div className="flex items-center gap-2"><BarChart3 size={17} className="text-zinc-500"/><h2 className="font-medium">Application pipeline</h2></div>
            <div className="mt-7 space-y-4">
              {stageCounts.map(([label, count]) => {
                const n = Number(count);
                const width = metrics.applications.length ? Math.max(3, Math.round((n / metrics.applications.length) * 100)) : 3;
                return <div key={String(label)}><div className="flex justify-between text-xs"><span className="text-zinc-500">{label}</span><span className="text-zinc-300">{n}</span></div><div className="mt-2 h-2 rounded-full bg-white/[.05]"><div className="h-full rounded-full bg-violet-400/70" style={{ width: width + "%" }}/></div></div>;
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <h2 className="font-medium">Career readiness</h2>
            <div className="mt-6 flex items-end gap-3"><span className="text-5xl font-semibold">{metrics.readiness}</span><span className="mb-2 text-xs text-zinc-600">/ 100</span></div>
            <div className="mt-4 h-2 rounded-full bg-white/[.05]"><div className="h-full rounded-full bg-violet-400/70" style={{ width: metrics.readiness + "%" }}/></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Mini label="Interview activity" value={metrics.interviewRate + "%"} />
              <Mini label="Offer record" value={metrics.offerRate + "%"} />
            </div>
            <p className="mt-5 text-[11px] leading-5 text-zinc-600">Rates are calculated only from records currently stored in CareerPilot. Small samples can make these percentages unstable.</p>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Insight icon={Target} title="Applications" text={metrics.applications.length ? "Keep recording every stage so CareerPilot can show where your pipeline changes." : "Start saving real opportunities and recording applications to create your first baseline."} href="/applications" />
          <Insight icon={FileText} title="Evidence" text={state.progress.completedProjects ? state.progress.completedProjects + " completed project(s) are recorded as career evidence." : "Complete a practical project to create evidence that can feed your resume and profile."} href="/projects" />
          <Insight icon={Globe2} title="Scope" text={state.primaryGoal?.scope ? "Current opportunity scope: " + state.primaryGoal.scope + "." : "Set your career goal scope to distinguish local, international and remote opportunities."} href="/career-goal" />
        </div>

        <section className="mt-5 rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
          <p className="text-xs text-zinc-600">OUTCOME HISTORY</p>
          <div className="mt-4 space-y-2">
            {state.applications.slice().reverse().slice(0, 8).map(app => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[.05] bg-black/10 p-4">
                <div><p className="text-xs font-medium">{app.title}</p><p className="mt-1 text-[11px] text-zinc-600">{app.company} · {app.location}</p></div>
                <span className="rounded-full border border-white/[.07] px-3 py-1 text-[10px] capitalize text-zinc-500">{app.stage.replace("-", " ")}</span>
              </div>
            ))}
            {!state.applications.length && <p className="py-8 text-center text-xs text-zinc-700">No application outcomes yet. Your history will appear here as you use the platform.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><Icon size={16} className="text-zinc-600"/><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">{label}</p></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><p className="text-lg font-semibold">{value}</p><p className="mt-1 text-[10px] text-zinc-700">{label}</p></div>;
}

function Insight({ icon: Icon, title, text, href }: { icon: typeof Target; title: string; text: string; href: string }) {
  return <a href={href} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5 transition hover:border-white/[.12]"><Icon size={16} className="text-zinc-600"/><h3 className="mt-4 text-sm font-medium">{title}</h3><p className="mt-2 text-xs leading-5 text-zinc-600">{text}</p><span className="mt-4 inline-block text-[11px] text-violet-300">Open module →</span></a>;
}
