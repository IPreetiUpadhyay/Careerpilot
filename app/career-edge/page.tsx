"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, Clock3, Radar, Sparkles, Target, TrendingUp, Wrench } from "lucide-react";
import { CareerState, loadCareerState, saveCareerState } from "../lib/career-state";

type EdgeItem = {
  id: string; type: "skill" | "tool" | "trend" | "method"; title: string; summary: string; why: string;
  skills: string[]; level: "Foundation" | "Intermediate" | "Advanced"; time: string;
  resource: string; resourceUrl: string; tags: string[];
};

const EDGE_LIBRARY: EdgeItem[] = [
  { id:"ai-assisted-analysis", type:"skill", title:"AI-assisted analysis", summary:"Use AI to accelerate exploration, documentation and first-pass analysis without outsourcing your judgment.", why:"Modern analysts increasingly combine domain reasoning with AI-assisted workflows.", skills:["SQL","Python","Data Analysis"], level:"Intermediate", time:"45 min", resource:"Google Machine Learning Education", resourceUrl:"https://developers.google.com/machine-learning", tags:["AI","Analytics","Productivity"] },
  { id:"ai-bi-workflows", type:"tool", title:"AI-powered BI workflows", summary:"Understand natural-language exploration, assisted modeling and AI-supported report creation.", why:"BI work is moving beyond static dashboards toward faster assisted analysis.", skills:["Power BI","Data Visualization"], level:"Intermediate", time:"60 min", resource:"Microsoft Learn", resourceUrl:"https://learn.microsoft.com/training/", tags:["BI","AI","Power BI"] },
  { id:"modern-sql", type:"skill", title:"Advanced SQL for analytical work", summary:"Move beyond basic queries into CTEs, window functions, query design and analytical patterns.", why:"Strong SQL remains a durable foundation for analytical roles.", skills:["SQL"], level:"Intermediate", time:"90 min", resource:"PostgreSQL Documentation", resourceUrl:"https://www.postgresql.org/docs/", tags:["SQL","Analytics","Core skill"] },
  { id:"semantic-layer", type:"method", title:"Semantic modeling", summary:"Learn how metrics, dimensions and business definitions create a reliable analytical layer.", why:"As analytics stacks become more complex, knowing what a metric means matters as much as calculating it.", skills:["Data Modeling","SQL","Power BI"], level:"Advanced", time:"75 min", resource:"Microsoft Learn", resourceUrl:"https://learn.microsoft.com/training/", tags:["Data Modeling","BI"] },
  { id:"python-analytics", type:"skill", title:"Python for real analytical workflows", summary:"Build repeatable analysis with pandas, notebooks, data cleaning and lightweight automation.", why:"Python can turn repetitive analysis into reusable workflows and stronger portfolio evidence.", skills:["Python","Data Analysis"], level:"Intermediate", time:"90 min", resource:"Python Documentation", resourceUrl:"https://docs.python.org/3/tutorial/", tags:["Python","Automation","Analytics"] },
  { id:"experimentation", type:"method", title:"Experimentation & causal thinking", summary:"Understand A/B testing, experiment design, bias and how to separate correlation from useful evidence.", why:"Decision-focused roles increasingly reward people who can connect analysis to business decisions.", skills:["Statistics","Data Analysis"], level:"Advanced", time:"75 min", resource:"Google Analytics Academy", resourceUrl:"https://analytics.google.com/analytics/academy/", tags:["Experimentation","Statistics","Decision science"] }
];

function getRelevantItems(state: CareerState) {
  const role = state.targetRole.toLowerCase();
  const skills = [...state.skills, ...state.skillRecords.map(s => s.name)].map(s => s.toLowerCase());
  return [...EDGE_LIBRARY].map(item => {
    const roleMatch =
      (role.includes("data") && item.tags.some(t => ["analytics","bi","data modeling"].includes(t.toLowerCase()))) ||
      (role.includes("product") && item.tags.some(t => ["experimentation","analytics","decision science"].includes(t.toLowerCase()))) ||
      (role.includes("software") && item.tags.some(t => ["ai","automation"].includes(t.toLowerCase())));
    const skillMatches = item.skills.filter(s => skills.some(x => x.includes(s.toLowerCase()) || s.toLowerCase().includes(x))).length;
    return { item, score: skillMatches * 3 + (roleMatch ? 4 : 0) };
  }).sort((a,b) => b.score-a.score).map(x => x.item);
}

export default function CareerEdgePage() {
  const [state,setState] = useState<CareerState|null>(null);
  const [filter,setFilter] = useState<"all"|EdgeItem["type"]>("all");
  const [active,setActive] = useState<string|null>(null);

  useEffect(() => {
    const refresh=()=>setState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated",refresh);
    return ()=>window.removeEventListener("careerpilot-state-updated",refresh);
  },[]);

  const items=useMemo(()=>{
    if(!state)return [];
    const relevant=getRelevantItems(state);
    return filter==="all"?relevant:relevant.filter(x=>x.type===filter);
  },[state,filter]);

  if(!state) return <main className="min-h-screen bg-[#08090d] grid place-items-center text-sm text-zinc-500">Loading Career Edge...</main>;

  const completed=new Set(state.careerEdge.map((entry) => entry.id));
  const role=state.targetRole||"your target role";
  const top=items[0];

  function complete(item:EdgeItem){
    if(!state || completed.has(item.id))return;
    const currentState = state;
    const next: CareerState = { ...currentState, version: currentState.version ?? 2, targetRole: currentState.targetRole ?? "", careerStage: currentState.careerStage ?? "Explorer", experience: currentState.experience ?? "", workMode: currentState.workMode ?? "", geography: currentState.geography ?? "", skills: currentState.skills ?? [], goalSet: currentState.goalSet ?? false, profile: { name: "", currentLocation: "", education: "", currentRole: "", ...(currentState.profile ?? {}) }, primaryGoal: currentState.primaryGoal ?? null, skillRecords: currentState.skillRecords ?? [], evidence: currentState.evidence ?? [], projects: currentState.projects ?? [], interviews: currentState.interviews ?? [], opportunities: currentState.opportunities ?? [], applications: currentState.applications ?? [], roadmap: currentState.roadmap ?? [], progress: { completedActions: 0, totalActions: 0, completedProjects: 0, verifiedSkills: 0, applications: 0, interviews: 0, xp: 0, ...(currentState.progress ?? {}) }, careerEdge: [...(currentState.careerEdge ?? []), { id: item.id, completedAt: new Date().toISOString() }], lastActionId: currentState.lastActionId ?? null, updatedAt: new Date().toISOString() };
    saveCareerState(next); setState(next);
  }

  return <main className="min-h-screen bg-[#08090d] text-zinc-100">
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute left-[18%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]"/><div className="absolute right-[-8%] top-[25%] h-[460px] w-[460px] rounded-full bg-cyan-500/[.06] blur-[130px]"/></div>
    <div className="relative mx-auto max-w-[1450px] px-5 py-7 sm:px-8 lg:px-10">
      <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
        <a href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ArrowLeft size={16}/> Command Center</a>
        <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black">C</span>CareerPilot</div>
        <span className="text-xs text-zinc-600">Career Edge</span>
      </header>

      <section className="py-10 sm:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-300"><Radar size={15}/> Career intelligence</div>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Stay ahead of <span className="text-violet-300">{role}.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">Career Edge keeps your learning alive after the roadmap ends, connecting emerging skills, tools and industry shifts to what you should learn next.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <div className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.12] via-white/[.03] to-cyan-400/[.04] p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs text-violet-200"><Sparkles size={15}/> Your next edge</div>
          <h2 className="mt-4 text-2xl font-semibold">{top?.title||"Build your professional edge"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{top?.summary||"Set a target role to receive more relevant intelligence."}</p>
          {top&&<div className="mt-5 flex flex-wrap gap-2">{top.tags.map(tag=><span key={tag} className="rounded-full border border-white/[.08] px-2.5 py-1 text-[11px] text-zinc-400">{tag}</span>)}</div>}
          {top&&<div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>setActive(top.id)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black">Explore signal <ChevronRight size={14}/></button><span className="flex items-center gap-1.5 py-2 text-xs text-zinc-600"><Clock3 size={13}/>{top.time}</span></div>}
        </div>
        <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
          <p className="text-xs uppercase tracking-[.16em] text-zinc-600">Edge progress</p>
          <div className="mt-4 text-4xl font-semibold">{completed.size}</div><p className="mt-1 text-xs text-zinc-500">signals explored</p>
          <div className="mt-5 h-1.5 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{width:`${Math.min(Math.round((completed.size/EDGE_LIBRARY.length)*100),100)}%`}}/></div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/[.05] p-3"><TrendingUp size={14} className="text-violet-300"/><p className="mt-2 text-zinc-500">Emerging skills</p></div><div className="rounded-xl border border-white/[.05] p-3"><Wrench size={14} className="text-cyan-300"/><p className="mt-2 text-zinc-500">New tools</p></div></div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">{(["all","skill","tool","trend","method"] as const).map(x=><button key={x} onClick={()=>setFilter(x)} className={`rounded-full border px-4 py-2 text-xs transition ${filter===x?"border-violet-400/30 bg-violet-400/10 text-violet-200":"border-white/[.07] text-zinc-500 hover:text-zinc-300"}`}>{x==="all"?"All signals":x==="skill"?"Emerging skills":x==="tool"?"Tools":x==="trend"?"Industry trends":"Methods"}</button>)}</div>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        {items.map(item=>{const done=completed.has(item.id);return <article key={item.id} className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[.14em] text-zinc-600"><span>{item.type}</span><span>•</span><span>{item.level}</span></div><h3 className="mt-2 text-lg font-semibold">{item.title}</h3></div>{done?<CheckCircle2 className="text-emerald-300" size={18}/>:<Target className="text-violet-300" size={18}/>}</div>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{item.summary}</p>
          <div className="mt-4 rounded-2xl border border-white/[.05] bg-black/10 p-4"><p className="text-[10px] uppercase tracking-[.14em] text-zinc-700">Why this matters</p><p className="mt-2 text-xs leading-5 text-zinc-400">{item.why}</p></div>
          <div className="mt-4 flex flex-wrap gap-2">{item.skills.map(skill=><span key={skill} className="rounded-full bg-white/[.04] px-2.5 py-1 text-[11px] text-zinc-500">{skill}</span>)}</div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[.06] pt-4"><div className="flex items-center gap-2 text-xs text-zinc-600"><BookOpen size={13}/>{item.resource} · {item.time}</div><button onClick={()=>setActive(item.id)} className="text-xs text-violet-300 hover:text-white">Open <ArrowUpRight className="inline" size={13}/></button></div>
        </article>})}
      </section>

      <p className="mt-7 text-[11px] leading-5 text-zinc-700">Career Edge currently uses a curated starter intelligence library. The intelligence layer is designed so live industry signals and official sources can be added without changing the learning workflow.</p>

      {active&&(()=>{const item=EDGE_LIBRARY.find(x=>x.id===active);if(!item)return null;const done=completed.has(item.id);return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm" onClick={()=>setActive(null)}>
        <div className="w-full max-w-xl rounded-3xl border border-white/[.1] bg-[#101117] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs text-violet-300">{item.type} · {item.level}</p><h2 className="mt-2 text-2xl font-semibold">{item.title}</h2></div><button onClick={()=>setActive(null)} className="text-zinc-600">×</button></div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{item.summary}</p>
          <div className="mt-5 rounded-2xl border border-white/[.06] p-4"><p className="text-xs font-medium text-zinc-300">Your learning path</p><div className="mt-3 space-y-3 text-xs text-zinc-500"><div>01 · Understand the concept and terminology</div><div>02 · Study the official learning resource</div><div>03 · Apply it to a practical task</div><div>04 · Capture evidence in CareerPilot</div></div></div>
          <div className="mt-5 flex gap-3"><a href={item.resourceUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black">Open learning resource <ArrowUpRight size={14}/></a><button onClick={()=>complete(item)} className={`rounded-xl border px-4 py-3 text-xs font-semibold ${done?"border-emerald-400/20 text-emerald-300":"border-white/[.08] text-zinc-300"}`}>{done?"Completed":"Mark explored"}</button></div>
        </div>
      </div>})()}
    </div>
  </main>;
}
