"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  Globe2,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import { CareerState, defaultCareerState, loadCareerState, saveCareerState } from "../lib/career-state";

const roles = [
  { name: "Data Analyst", description: "Turn data into insights, dashboards and decisions.", skills: ["SQL", "Excel", "Power BI", "Python"] },
  { name: "Business Analyst", description: "Bridge business problems, data and practical solutions.", skills: ["Excel", "SQL", "Power BI", "Communication"] },
  { name: "Product Analyst", description: "Use product data to understand users and improve outcomes.", skills: ["SQL", "Python", "Analytics", "Experimentation"] },
  { name: "Data Scientist", description: "Build analytical and machine-learning solutions from data.", skills: ["Python", "SQL", "Statistics", "Machine Learning"] },
];

const modes = ["Hybrid / Remote", "Remote only", "On-site", "Flexible"];
const geographies = ["India", "India + International", "International / Relocation", "Remote worldwide"];

export default function CareerGoalPage() {
  const [state, setState] = useState<CareerState>(defaultCareerState);

  useEffect(() => {
    let cancelled = false;

    async function loadGoal() {
      setState(loadCareerState());

      try {
        const response = await fetch("/api/career-goals", { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/auth";
            return;
          }
          throw new Error("Could not load career goal.");
        }

        const result = await response.json();
        const active = result.goals?.find((goal: { status: string }) => goal.status === "active");

        if (!cancelled && active) {
          setGoalId(active.id);
          setState((current) => ({
            ...current,
            targetRole: active.targetRole ?? current.targetRole,
            workMode: active.workMode ?? current.workMode,
            geography: active.targetLocation ?? current.geography,
            goalSet: true,
          }));
        }
      } catch {
        if (!cancelled) setError("Could not load your saved career goal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGoal();
    return () => {
      cancelled = true;
    };
  }, []);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.name === state.targetRole) ?? roles[0],
    [state.targetRole]
  );

  function chooseRole(role: typeof roles[number]) {
    setState((current) => ({ ...current, targetRole: role.name, skills: role.skills }));
  }

  async function finish() {
    setSaving(true);
    setError("");

    const scope =
      state.geography === "India" ? "india" :
      state.geography === "International / Relocation" ? "international" :
      state.geography === "Remote worldwide" ? "remote-worldwide" : "both";

    const payload = {
      title: selectedRole.name,
      targetRole: selectedRole.name,
      targetLocation: state.geography,
      workMode: state.workMode,
      status: "active",
    };

    try {
      const response = await fetch("/api/career-goals", {
        method: goalId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalId ? { ...payload, id: goalId } : payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not save career goal.");

      const persistedGoal = result.goal;
      setGoalId(persistedGoal.id);

      const next: CareerState = {
        ...state,
        version: 2,
        goalSet: true,
        targetRole: selectedRole.name,
        skills: selectedRole.skills,
        profile: {
          ...state.profile,
          currentLocation: state.profile.currentLocation || "",
          education: state.profile.education || "",
          currentRole: state.profile.currentRole || "",
        },
        primaryGoal: {
          id: persistedGoal.id,
          role: selectedRole.name,
          type: "explore",
          seniority: "Entry-level",
          scope,
          workModes: state.workMode === "Remote only" ? ["remote"] :
            state.workMode === "On-site" ? ["onsite"] :
            state.workMode === "Hybrid / Remote" ? ["hybrid", "remote"] : ["flexible"],
          preferredLocations: state.geography ? [state.geography] : [],
          active: true,
          createdAt: persistedGoal.createdAt,
        },
      };

      saveCareerState(next);
      setState(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save career goal.");
    } finally {
      setSaving(false);
    }
  }


  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[-18%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-8%] top-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.06] blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-[1050px] px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <a href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ChevronLeft size={17} /> Dashboard</a>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Target size={16} /></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Career Goal</span>
        </header>
        <div className="mx-auto max-w-3xl py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Sparkles size={14} /> Career Intelligence</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.035em] sm:text-5xl">Give CareerPilot a destination.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">Your goal becomes the anchor for your skill gaps, roadmap, learning recommendations, resume analysis and job matching.</p>
          </div>
          <div className="mb-7 flex gap-2">{[1,2,3].map((item)=><div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-white/[.07]"}`} />)}</div>

          {step === 1 && (
            <section className="rounded-3xl border border-white/[.08] bg-white/[.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[.18em] text-zinc-600">01 · Target role</p>
              <h2 className="mt-2 text-2xl font-semibold">What role are you moving toward?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {roles.map((role) => {
                  const active = role.name === state.targetRole;
                  return <button key={role.name} onClick={() => chooseRole(role)} className={`rounded-2xl border p-5 text-left transition ${active ? "border-violet-400/40 bg-violet-400/[.08]" : "border-white/[.07] bg-black/10 hover:border-white/15"}`}>
                    <div className="flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.06]"><BriefcaseBusiness size={18} className={active ? "text-violet-300" : "text-zinc-500"} /></div>{active && <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-400 text-black"><Check size={14} /></span>}</div>
                    <h3 className="mt-4 font-semibold">{role.name}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{role.description}</p>
                  </button>;
                })}
              </div>
              <button onClick={() => setStep(2)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black">Continue <ArrowRight size={16} /></button>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-3xl border border-white/[.08] bg-white/[.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[.18em] text-zinc-600">02 · Opportunity scope</p>
              <h2 className="mt-2 text-2xl font-semibold">Where and how do you want to work?</h2>
              <div className="mt-7"><div className="flex items-center gap-2 text-sm font-medium"><MapPin size={16} className="text-cyan-300" /> Work mode</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{modes.map((mode)=><button key={mode} onClick={()=>setState((s)=>({...s,workMode:mode}))} className={`rounded-xl border px-4 py-3 text-left text-sm ${state.workMode===mode?"border-cyan-300/30 bg-cyan-300/[.07] text-cyan-200":"border-white/[.07] text-zinc-500"}`}>{mode}</button>)}</div>
              </div>
              <div className="mt-7"><div className="flex items-center gap-2 text-sm font-medium"><Globe2 size={16} className="text-violet-300" /> Opportunity geography</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{geographies.map((geo)=><button key={geo} onClick={()=>setState((s)=>({...s,geography:geo}))} className={`rounded-xl border px-4 py-3 text-left text-sm ${state.geography===geo?"border-violet-300/30 bg-violet-300/[.07] text-violet-200":"border-white/[.07] text-zinc-500"}`}>{geo}</button>)}</div>
              </div>
              <div className="mt-7 flex gap-3"><button onClick={()=>setStep(1)} className="rounded-xl border border-white/[.08] px-5 py-3 text-sm text-zinc-400">Back</button><button onClick={()=>setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black">Review goal <ArrowRight size={16} /></button></div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-3xl border border-white/[.08] bg-white/[.025] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[.18em] text-zinc-600">03 · Career state</p>
              <h2 className="mt-2 text-2xl font-semibold">This becomes your CareerPilot anchor.</h2>
              <div className="mt-7 rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.10] to-cyan-400/[.04] p-5"><div className="text-xs text-violet-200">Primary career goal</div><div className="mt-2 text-2xl font-semibold">{selectedRole.name}</div><p className="mt-2 text-sm text-zinc-500">{selectedRole.description}</p></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><Summary icon={MapPin} label="Work mode" value={state.workMode} /><Summary icon={Globe2} label="Geography" value={state.geography} /></div>
              <div className="mt-4 rounded-2xl border border-white/[.07] bg-black/10 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Initial skill map</p><p className="mt-1 text-xs text-zinc-600">These become the first nodes in your skill-gap analysis.</p></div><span className="text-xs text-zinc-600">{selectedRole.skills.length} skills</span></div><div className="mt-4 flex flex-wrap gap-2">{selectedRole.skills.map((skill)=><span key={skill} className="rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-xs text-zinc-300">{skill}</span>)}</div></div>
              {error && <p className="mt-5 text-sm text-red-400">{error}</p>}
              {saved ? <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] p-5"><p className="font-medium text-emerald-200">Career goal saved.</p><p className="mt-1 text-xs text-zinc-500">Your goal is now stored in your CareerPilot profile and can drive the next modules.</p><a href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200">Open Command Center <ArrowRight size={15} /></a></div>
              : <div className="mt-7 flex gap-3"><button onClick={()=>setStep(2)} className="rounded-xl border border-white/[.08] px-5 py-3 text-sm text-zinc-400">Back</button><button disabled={saving} onClick={finish} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-60">{saving ? "Saving..." : "Set my career goal"} <Target size={16} /></button></div>}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><Icon size={16} className="text-zinc-600" /><p className="mt-3 text-xs text-zinc-600">{label}</p><p className="mt-1 text-sm font-medium">{value || "Not set"}</p></div>;
}
