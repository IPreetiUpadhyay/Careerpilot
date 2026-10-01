"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Clock3, MessageSquare, RotateCcw, Sparkles, Target } from "lucide-react";
import { CareerState, InterviewSession, InterviewType, loadCareerState, saveCareerState } from "../lib/career-state";

const TYPES:{id:InterviewType;label:string;desc:string}[]=[
 {id:"hr",label:"HR",desc:"Motivation, communication and career story"},
 {id:"technical",label:"Technical",desc:"Role-specific concepts and problem solving"},
 {id:"behavioral",label:"Behavioral",desc:"Experience, decisions and real situations"},
 {id:"case",label:"Case",desc:"Structured thinking and business scenarios"}
];

const QUESTIONS:Record<InterviewType,string[]> = {
 hr:["Tell me about yourself and why you are targeting this role.","Why do you want to work in this role?","What is one skill you are currently improving?"],
 technical:["Walk me through how you would solve a data problem from raw data to a useful insight.","Explain a technical concept from your target role to a non-technical stakeholder.","How would you validate that your analysis or solution is correct?"],
 behavioral:["Tell me about a difficult problem you solved. What did you do and what happened?","Tell me about a time you received critical feedback. How did you respond?","Describe a situation where you had to learn something quickly."],
 case:["A company says customer retention dropped 15%. How would you investigate the problem?","A team has many dashboards but decisions are still slow. How would you diagnose this?","A business wants to launch a new product. What information would you analyze first?"]
};

export default function InterviewArena(){
 const [state,setState]=useState<CareerState|null>(null); const [type,setType]=useState<InterviewType>("hr"); const [answer,setAnswer]=useState(""); const [index,setIndex]=useState(0); const [result,setResult]=useState<InterviewSession|null>(null);
 useEffect(()=>{const r=()=>setState(loadCareerState());r();window.addEventListener("careerpilot-state-updated",r);return()=>window.removeEventListener("careerpilot-state-updated",r)},[]);
 if(!state)return <Loading/>; const current=state; const role=current.targetRole||"your target role"; const history=Array.isArray(current.interviews)?current.interviews:[];
 const question=QUESTIONS[type][index%QUESTIONS[type].length];
 const avg=history.length?Math.round(history.reduce((a,x)=>a+x.scores.overall,0)/history.length):0;
 function evaluate(){
  const words=answer.trim().split(/\s+/).filter(Boolean).length;
  const sentences=answer.split(/[.!?]+/).filter(x=>x.trim()).length;
  const keywords=[...(current.skills??[]),role.split(" ")[0]].filter(Boolean).map(x=>x.toLowerCase());
  const lower=answer.toLowerCase(); const hits=keywords.filter(k=>lower.includes(k)).length;
  const relevance=Math.min(100,45+hits*12+(words>45?10:0)); const structure=Math.min(100,45+(sentences>=3?25:10)+(words>80?15:0));
  const clarity=Math.min(100,50+(words>=40&&words<=180?25:10)+(sentences>=3?10:0)); const completeness=Math.min(100,40+(words>=70?25:10)+(hits?15:0));
  const technical=type==="technical"||type==="case"?Math.min(100,45+hits*10+(words>70?20:0)):75;
  const overall=Math.round((relevance+structure+clarity+completeness+technical)/5);
  const feedback=overall>=80?"Strong response. Tighten the opening and add one concrete outcome to make it interview-ready.":overall>=65?"Good foundation. Add more specific evidence, structure your answer clearly, and finish with the result.":"Needs more evidence. Use a clear situation → action → result structure and connect your answer to the target role.";
  const session:InterviewSession={id:"int-"+Date.now(),type,role,question,answer,scores:{relevance,structure,clarity,completeness,technical,overall},feedback,createdAt:new Date().toISOString()};
  const n={...current,interviews:[session,...history],progress:{...current.progress,interviews:current.progress.interviews+1,xp:current.progress.xp+10}};saveCareerState(n);setState(n);setResult(session);
 }
 function next(){setResult(null);setAnswer("");setIndex(x=>x+1)}
 return <main className="min-h-screen bg-[#08090d] text-zinc-100"><div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
 <header className="flex items-center justify-between border-b border-white/[.07] pb-6"><a href="/applications" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ArrowLeft size={16}/> Applications</a><div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black">C</span>CareerPilot</div><span className="text-xs text-zinc-600">Interview Arena</span></header>
 <section className="py-9"><p className="text-xs text-violet-300">Interview intelligence</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Practice like the <span className="text-violet-300">real interview</span> is tomorrow.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">Questions adapt to your target role and Career DNA. Answer, get scored, learn what to improve, and go again.</p></section>
 <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><p className="text-xs text-zinc-600">Target role</p><p className="mt-3 font-semibold">{role}</p></div><div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><p className="text-xs text-zinc-600">Sessions</p><p className="mt-3 text-2xl font-semibold">{history.length}</p></div><div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><p className="text-xs text-zinc-600">Average score</p><p className="mt-3 text-2xl font-semibold">{avg}<span className="text-sm text-zinc-600">/100</span></p></div></div>
 <div className="mt-6 grid gap-6 lg:grid-cols-[.85fr_1.5fr]"><aside className="space-y-2">{TYPES.map(t=><button key={t.id} onClick={()=>{setType(t.id);setIndex(0);setResult(null);setAnswer("")}} className={`w-full rounded-2xl border p-4 text-left ${type===t.id?"border-violet-300/30 bg-violet-300/[.07]":"border-white/[.07] bg-white/[.02]"}`}><div className="flex items-center gap-3"><Brain size={17} className="text-violet-300"/><span className="text-sm font-semibold">{t.label}</span></div><p className="mt-2 text-xs leading-5 text-zinc-600">{t.desc}</p></button>)}<div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5"><div className="flex items-center gap-2 text-xs text-zinc-500"><Target size={14}/> Career-linked practice</div><p className="mt-2 text-xs leading-5 text-zinc-600">Your skills, target role and previous answers shape the evaluation.</p></div></aside>
 <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6 sm:p-8"><div className="flex items-center justify-between"><span className="text-xs text-zinc-600">{TYPES.find(x=>x.id===type)?.label} · Question {index+1}</span><span className="flex items-center gap-1 text-xs text-zinc-600"><Clock3 size={13}/> ~3 min</span></div><h2 className="mt-6 text-xl font-semibold leading-8">{question}</h2><textarea value={answer} onChange={e=>setAnswer(e.target.value)} disabled={!!result} placeholder="Write your answer as if you were speaking to an interviewer..." className="mt-6 min-h-52 w-full resize-y rounded-2xl border border-white/[.07] bg-black/20 p-5 text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700"/>{!result?<button disabled={answer.trim().length<10} onClick={evaluate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-30"><Sparkles size={15}/> Evaluate my answer</button>:<div className="mt-5 rounded-2xl border border-violet-300/15 bg-violet-300/[.04] p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-zinc-600">Overall response</p><p className="mt-1 text-3xl font-semibold text-violet-200">{result.scores.overall}<span className="text-sm text-zinc-600">/100</span></p></div><CheckCircle2 className="text-violet-300"/></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(result.scores).filter(([k])=>k!=="overall").map(([k,v])=><div key={k} className="rounded-xl bg-black/20 p-3"><p className="text-[10px] capitalize text-zinc-600">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}</div><p className="mt-5 text-xs leading-6 text-zinc-400">{result.feedback}</p><button onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.08] py-3 text-xs text-zinc-300"><RotateCcw size={14}/> Next question</button></div>}</section></div>
 {history.length>0&&<section className="mt-6 rounded-3xl border border-white/[.07] bg-white/[.025] p-6"><div className="flex items-center gap-2 text-sm font-semibold"><MessageSquare size={16} className="text-violet-300"/> Recent practice</div><div className="mt-4 space-y-2">{history.slice(0,5).map(h=><div key={h.id} className="flex items-center justify-between rounded-xl border border-white/[.06] p-4"><div><p className="text-xs font-medium">{h.type.toUpperCase()} · {h.role}</p><p className="mt-1 max-w-xl truncate text-[11px] text-zinc-600">{h.question}</p></div><span className="text-sm font-semibold text-violet-200">{h.scores.overall}</span></div>)}</div></section>}</div></main>
}
function Loading(){return <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-zinc-500">Loading Interview Arena...</main>}
