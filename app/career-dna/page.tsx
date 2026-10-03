"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Data = {
  currentStatus: string;
  currentRole: string;
  yearsExperience: string;
  education: string;
  educationDetails: string;
  interests: string;
  targetRole: string;
  workMode: string;
  geography: string;
  internationalInterest: boolean;
  remoteInterest: boolean;
  skills: string[];
  bio: string;
};

const defaults: Data = {
  currentStatus: "", currentRole: "", yearsExperience: "", education: "",
  educationDetails: "", interests: "", targetRole: "", workMode: "",
  geography: "", internationalInterest: false, remoteInterest: false, skills: [], bio: ""
};

const statusOptions = ["Student","Working professional","Looking for my first job","Career switcher","Freelancer","Self-employed","Between jobs"];
const educationOptions = ["10th / Secondary","12th / Higher Secondary","Diploma","BCA","B.Tech / BE","B.Com","BBA","BA","B.Sc","MBA","MCA","Other degree"];
const interestOptions = ["Data & Analytics","Technology & Software","AI & Machine Learning","Finance & Business","Marketing & Growth","Product & Strategy","Design & Creative","Sales & Customer Success","Healthcare","Education","Operations","Consulting"];
const skillOptions = ["SQL","Excel","Python","Data Analysis","Power BI","Communication","Problem Solving","Programming","Design","Project Management","Marketing","Research"];

export default function CareerDNA() {
  const router = useRouter();
  const [data,setData] = useState<Data>(defaults);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [saved,setSaved] = useState(false);
  const [error,setError] = useState("");
  const [step,setStep] = useState(0);

  useEffect(() => {
    fetch("/api/career-profile",{cache:"no-store"})
      .then(async r => {
        if(r.status===401){ router.push("/auth"); return null; }
        if(!r.ok) throw new Error("Could not load Career DNA.");
        return r.json();
      })
      .then(result => {
        if(result?.profile) {
          const p=result.profile;
          setData({
            currentStatus:p.currentStatus??"", currentRole:p.currentRole??"",
            yearsExperience:p.yearsExperience==null?"":String(p.yearsExperience),
            education:p.education??"", educationDetails:p.educationDetails??"",
            interests:p.interests??"", targetRole:p.targetRole??"",
            workMode:p.workMode??"", geography:p.geography??"",
            internationalInterest:Boolean(p.internationalInterest), remoteInterest:Boolean(p.remoteInterest),
            skills:Array.isArray(p.skills)?p.skills:[], bio:p.bio??""
          });
        }
      })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[router]);

  const set = (key:keyof Data,value:Data[keyof Data]) => setData(d=>({...d,[key]:value}));
  const toggleSkill = (skill:string) => set("skills",data.skills.includes(skill)?data.skills.filter(s=>s!==skill):[...data.skills,skill]);

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const r=await fetch("/api/career-profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const result=await r.json();
      if(!r.ok) throw new Error(result.error||"Could not save Career DNA.");
      setSaved(true);
    } catch(e) { setError(e instanceof Error?e.message:"Could not save Career DNA."); }
    finally { setSaving(false); }
  }

  const sections = ["Current Profile","Career Direction","Skills & Context"];

  if(loading) return <main className="min-h-screen bg-[#07080d] text-white flex items-center justify-center text-sm text-[#9a9cab]">Loading your Career DNA...</main>;

  return (
    <main className="min-h-screen bg-[#07080d] text-[#f7f7fb]">
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between">
          <button onClick={()=>router.push("/dashboard")} className="text-xl font-bold tracking-[-.04em]">CareerPilot</button>
          <button onClick={()=>router.push("/dashboard")} className="text-sm text-[#9a9cab] hover:text-white">Dashboard</button>
        </header>

        <section className="mt-12">
          <p className="text-sm font-medium text-[#9a9cab]">Career DNA</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Build your professional identity.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9a9cab]">This becomes the foundation for your roadmap, skill gaps, job matches and career recommendations.</p>
            </div>
            <span className="text-xs text-[#6f7180]">{sections[step]} · {step+1}/3</span>
          </div>
          <div className="mt-7 h-1 rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#8b5cf6] transition-all" style={{width:`${((step+1)/3)*100}%`}} /></div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/[.09] bg-white/[.025] p-5 sm:p-7">
          {step===0 && <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Where are you right now?"><div className="grid gap-2">{statusOptions.map(o=><Choice key={o} selected={data.currentStatus===o} onClick={()=>set("currentStatus",o)}>{o}</Choice>)}</div></Field>
            <Field label="Current role"><Input value={data.currentRole} onChange={v=>set("currentRole",v)} placeholder="e.g. Data Analyst, Student, Software Engineer" /></Field>
            <Field label="Years of experience"><Input value={data.yearsExperience} onChange={v=>set("yearsExperience",v)} placeholder="0" type="number" /></Field>
            <Field label="Highest / current education"><div className="grid gap-2 sm:grid-cols-2">{educationOptions.map(o=><Choice key={o} selected={data.education===o} onClick={()=>set("education",o)}>{o}</Choice>)}</div></Field>
            <Field label="Education details" hint="Optional"><Input value={data.educationDetails} onChange={v=>set("educationDetails",v)} placeholder="College, specialization, graduation year..." /></Field>
            <Field label="Short professional bio" hint="Optional"><textarea value={data.bio} onChange={e=>set("bio",e.target.value)} placeholder="Tell CareerPilot anything important about your background..." className="min-h-32 w-full rounded-xl border border-white/[.1] bg-white/[.035] p-4 text-sm outline-none placeholder:text-[#626473] focus:border-[#8b5cf6]" /></Field>
          </div>}

          {step===1 && <div className="grid gap-6 sm:grid-cols-2">
            <Field label="What interests you?"><div className="grid gap-2 sm:grid-cols-2">{interestOptions.map(o=><Choice key={o} selected={data.interests===o} onClick={()=>set("interests",o)}>{o}</Choice>)}</div></Field>
            <div className="space-y-6">
              <Field label="Target role"><Input value={data.targetRole} onChange={v=>set("targetRole",v)} placeholder="e.g. Data Scientist" /></Field>
              <Field label="Preferred work mode"><div className="grid grid-cols-2 gap-2">{["Remote","Hybrid","On-site","Flexible"].map(o=><Choice key={o} selected={data.workMode===o} onClick={()=>set("workMode",o)}>{o}</Choice>)}</div></Field>
              <Field label="Preferred geography"><Input value={data.geography} onChange={v=>set("geography",v)} placeholder="e.g. Delhi NCR, India, Worldwide" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Open to international opportunities" checked={data.internationalInterest} onClick={()=>set("internationalInterest",!data.internationalInterest)} />
                <Toggle label="Interested in remote roles" checked={data.remoteInterest} onClick={()=>set("remoteInterest",!data.remoteInterest)} />
              </div>
            </div>
          </div>}

          {step===2 && <div>
            <Field label="Skills you already have" hint="These are starting signals. CareerPilot can verify them later.">
              <div className="grid gap-2 sm:grid-cols-3">{skillOptions.map(s=><Choice key={s} selected={data.skills.includes(s)} onClick={()=>toggleSkill(s)}>{s}</Choice>)}</div>
              <div className="mt-5"><Input value={data.skills.filter(s=>!skillOptions.includes(s)).join(", ")} onChange={v=>set("skills",[...data.skills.filter(s=>skillOptions.includes(s)),...v.split(",").map(x=>x.trim()).filter(Boolean)])} placeholder="Add other skills, separated by commas" /></div>
            </Field>
            <div className="mt-7 rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/[.06] p-4 text-sm text-[#b9b0ff]">Your selected skills are not treated as verified expertise. They become inputs for assessments, projects and evidence later.</div>
          </div>}

          {error && <p className="mt-5 text-sm text-red-400">{error}</p>}
          {saved && <p className="mt-5 text-sm text-emerald-400">Career DNA saved successfully.</p>}

          <footer className="mt-8 flex items-center justify-between border-t border-white/[.08] pt-5">
            <button onClick={()=>step===0?router.push("/dashboard"):setStep(step-1)} className="text-sm text-[#9a9cab] hover:text-white">{step===0?"Cancel":"Back"}</button>
            <div className="flex gap-2">
              {step<2 ? <button onClick={()=>setStep(step+1)} className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-[#171717]">Continue →</button> : <button disabled={saving} onClick={save} className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-[#171717]">{saving?"Saving...":"Save Career DNA"}</button>}
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function Field({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}) {
  return <div><div className="mb-3 flex items-baseline justify-between"><label className="text-sm font-medium">{label}</label>{hint&&<span className="text-xs text-[#6f7180]">{hint}</span>}</div>{children}</div>;
}
function Input({value,onChange,placeholder,type="text"}:{value:string;onChange:(v:string)=>void;placeholder:string;type?:string}) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-white/[.1] bg-white/[.035] px-4 text-sm outline-none placeholder:text-[#626473] focus:border-[#8b5cf6]" />;
}
function Choice({selected,onClick,children}:{selected:boolean;onClick:()=>void;children:React.ReactNode}) {
  return <button type="button" onClick={onClick} className={`min-h-11 rounded-xl border px-3 text-left text-sm transition ${selected?"border-white bg-white text-[#171717]":"border-white/[.09] bg-white/[.025] text-[#d8d8df] hover:border-white/[.22]"}`}>{children}</button>;
}
function Toggle({label,checked,onClick}:{label:string;checked:boolean;onClick:()=>void}) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs ${checked?"border-[#8b5cf6]/40 bg-[#8b5cf6]/10":"border-white/[.09] bg-white/[.025]"}`}><span>{label}</span><span className={`h-5 w-9 rounded-full p-0.5 ${checked?"bg-[#8b5cf6]":"bg-white/[.15]"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked?"translate-x-4":""}`}/></span></button>;
}
