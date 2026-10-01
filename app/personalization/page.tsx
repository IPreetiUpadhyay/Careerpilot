"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, Compass, FileCheck2, Flame, Search, Sparkles, Target, Wrench } from "lucide-react";
import { CareerState, loadCareerState } from "../lib/career-state";
import { buildPersonalization } from "../lib/personalization";

const labels = {
  skill: { title: "Build your highest-impact skills", icon: Wrench, href: "/skills-gap" },
  evidence: { title: "Strengthen your evidence", icon: FileCheck2, href: "/projects" },
  "job-search": { title: "Expand your opportunity pipeline", icon: Search, href: "/jobs" },
  interview: { title: "Prepare for interviews", icon: Target, href: "/interview-arena" },
  "career-edge": { title: "Stay ahead in your field", icon: Flame, href: "/career-edge" },
};

export default function PersonalizationPage() {
  const [state, setState] = useState<CareerState | null>(null);

  useEffect(() => {
    const refresh = () => setState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const profile = useMemo(() => state ? buildPersonalization(state) : null, [state]);
  if (!state || !profile) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading Personalization...</main>;

  const focus = labels[profile.preferredFocus];
  const Icon = focus.icon;

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Personalization</span>
        </header>

        <section className="py-9">
          <div className="flex items-center gap-2 text-xs text-violet-300"><Brain size={15}/> Adaptive career system</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">CareerPilot adapts to where you are.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">Your recommendations change as your skills, evidence, applications and interview activity change. The system uses your actual Career State rather than a fixed checklist.</p>
        </section>

        <section className="rounded-3xl border border-violet-300/10 bg-violet-300/[.035] p-6 sm:p-8">
          <p className="text-xs text-violet-300">CURRENT PERSONALIZED FOCUS</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[.06]"><Icon size={22} className="text-violet-200"/></div><div><h2 className="text-xl font-semibold">{focus.title}</h2><p className="mt-1 text-xs text-zinc-600">{profile.reasons[0]}</p></div></div>
            <a href={focus.href} className="rounded-xl bg-white px-4 py-2.5 text-center text-xs font-semibold text-black">Open focus →</a>
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric label="Personalization confidence" value={profile.confidence + "%"} />
          <Metric label="Career readiness" value={profile.context.readiness + "/100"} />
          <Metric label="Skill readiness" value={profile.context.skillReadiness + "/100"} />
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-xs text-zinc-600">YOUR SIGNALS</p>
            <div className="mt-5 space-y-3">
              <Signal icon={Compass} label="Target role" value={profile.context.targetRole || "Not set"} />
              <Signal icon={FileCheck2} label="Completed projects" value={String(profile.context.completedProjects)} />
              <Signal icon={Search} label="Active applications" value={String(profile.context.activeApplications)} />
              <Signal icon={Target} label="Interview sessions" value={String(profile.context.interviewSessions)} />
            </div>
          </div>
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-xs text-zinc-600">WHY THIS FOCUS</p>
            <div className="mt-5 space-y-4">{profile.reasons.map((reason, i) => <div key={i} className="flex gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet-300"/><p className="text-xs leading-5 text-zinc-500">{reason}</p></div>)}</div>
            <p className="mt-6 text-[11px] leading-5 text-zinc-700">This is an adaptive planning signal, not a prediction of career outcomes.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">{label}</p></div>;
}

function Signal({ icon: Icon, label, value }: { icon: typeof Compass; label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-white/[.05] bg-black/10 p-4"><div className="flex items-center gap-3"><Icon size={15} className="text-zinc-600"/><span className="text-xs text-zinc-500">{label}</span></div><span className="max-w-[55%] truncate text-xs text-zinc-300">{value}</span></div>;
}
