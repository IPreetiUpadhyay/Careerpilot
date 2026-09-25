 "use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Globe2,
  Heart,
  Laptop,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const interestOptions = [
  "Working with data",
  "Building technology",
  "Business & strategy",
  "Design & creativity",
  "Helping people",
  "Research & problem solving",
  "Communication",
  "Finance",
];

const workOptions = ["Remote", "Hybrid", "On-site", "Flexible"];
const scopeOptions = ["India", "International", "Both"];
const educationOptions = ["No formal degree", "Bachelor's", "Master's", "Other"];
const experienceOptions = ["Student / Fresher", "0–2 years", "3–5 years", "5+ years"];

const careers = [
  {
    title: "Data Analyst",
    category: "Analytics",
    icon: BarChart3,
    fit: 91,
    description: "Turn business questions into insights using data, dashboards and structured analysis.",
    reasons: ["Strong analytical orientation", "SQL / Excel are useful foundations", "Accessible path for early-career profiles"],
    skills: ["SQL", "Excel", "Power BI", "Statistics"],
    evidence: ["2–3 portfolio projects", "SQL assessment", "Dashboard project"],
    time: "3–6 months",
    demand: "Broad opportunity base",
    tone: "violet",
  },
  {
    title: "Business Analyst",
    category: "Business",
    icon: BriefcaseBusiness,
    fit: 84,
    description: "Bridge business needs and technology through requirements, analysis and communication.",
    reasons: ["Combines analysis with communication", "Strong cross-functional pathway", "Transferable business skills"],
    skills: ["SQL", "Excel", "Requirements", "Data storytelling"],
    evidence: ["Case study", "Requirements document", "Analytics project"],
    time: "4–7 months",
    demand: "Strong cross-industry relevance",
    tone: "cyan",
  },
  {
    title: "Product Analyst",
    category: "Product & Data",
    icon: TrendingUp,
    fit: 78,
    description: "Use product data to understand user behavior, measure experiments and guide decisions.",
    reasons: ["Data + product thinking", "Good fit for curious problem solvers", "Natural progression from analytics"],
    skills: ["SQL", "Product metrics", "Experimentation", "Visualization"],
    evidence: ["Product case study", "Funnel analysis", "Experiment design"],
    time: "5–8 months",
    demand: "Growing specialization",
    tone: "emerald",
  },
];

export default function CareerDiscovery() {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState(["Working with data", "Research & problem solving"]);
  const [workStyle, setWorkStyle] = useState(["Remote", "Hybrid"]);
  const [scope, setScope] = useState("Both");
  const [education, setEducation] = useState("Bachelor's");
  const [experience, setExperience] = useState("Student / Fresher");
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [goalSaved, setGoalSaved] = useState(false);

  const progress = Math.round((step / 3) * 100);

  const visibleCareers = useMemo(() => {
    return careers.map((career, index) => ({
      ...career,
      fit: Math.max(64, career.fit - (interests.includes("Working with data") ? 0 : index === 0 ? 8 : 2)),
    }));
  }, [interests]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function chooseCareer(title: string) {
    setSelectedCareer(title);
    setGoalSaved(false);
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[-18%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute right-[-8%] top-[30%] h-[460px] w-[460px] rounded-full bg-cyan-500/[.055] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="rounded-xl border border-white/[.07] p-2 text-zinc-500 hover:text-white">
              <ArrowLeft size={17} />
            </a>
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-zinc-600">CareerPilot</p>
              <h1 className="mt-1 text-lg font-semibold">Career Discovery</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-zinc-600 sm:flex">
            <Sparkles size={14} className="text-violet-400" /> Explainable career intelligence
          </div>
        </header>

        <section className="mx-auto mt-9 max-w-4xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[.07] text-violet-300">
            <Target size={20} />
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[.22em] text-violet-300/70">Find your direction</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">
            Don't choose a career by guessing.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            CareerPilot combines your interests, strengths, background and preferences to surface career paths and explain why each one fits.
          </p>
        </section>

        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-700">
            <span>Profile signals</span>
            <span>Step {step} of 3</span>
          </div>
          <div className="mt-3 h-1 rounded-full bg-white/[.05]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {step < 3 ? (
          <section className="mx-auto mt-6 max-w-4xl rounded-3xl border border-white/[.07] bg-white/[.025] p-6 sm:p-8">
            {step === 1 ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-violet-300">01 · What pulls you in?</p>
                    <h3 className="mt-2 text-2xl font-semibold">What kind of work sounds interesting?</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">Pick as many as feel genuinely relevant. There is no “correct” answer.</p>
                  </div>
                  <CircleHelp size={17} className="text-zinc-700" />
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {interestOptions.map((item) => (
                    <Choice key={item} active={interests.includes(item)} onClick={() => toggle(interests, item, setInterests)}>{item}</Choice>
                  ))}
                </div>

                <div className="mt-8 border-t border-white/[.06] pt-7">
                  <p className="text-xs font-medium text-zinc-300">How do you prefer to work?</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {workOptions.map((item) => (
                      <Choice key={item} compact active={workStyle.includes(item)} onClick={() => toggle(workStyle, item, setWorkStyle)}>{item}</Choice>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-violet-300">02 · Your starting point</p>
                <h3 className="mt-2 text-2xl font-semibold">Where are you starting from?</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-600">CareerPilot uses this to avoid recommending paths that ignore your actual context.</p>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <SelectBlock label="Education" value={education} options={educationOptions} onChange={setEducation} icon={GraduationCapIcon} />
                  <SelectBlock label="Experience" value={experience} options={experienceOptions} onChange={setExperience} icon={Users} />
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-zinc-300">Opportunity scope</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scopeOptions.map((item) => <Choice key={item} compact active={scope === item} onClick={() => setScope(item)}>{item}</Choice>)}
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <Signal icon={Laptop} title="Work mode" value={workStyle.join(" + ") || "Flexible"} />
                  <Signal icon={Globe2} title="Scope" value={scope} />
                  <Signal icon={MapPin} title="Starting point" value={experience} />
                </div>
              </>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && interests.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {step === 1 ? "Analyze my direction" : "Generate career paths"} <ArrowRight size={14} />
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-3xl border border-violet-400/10 bg-violet-400/[.04] p-6 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-violet-200"><Sparkles size={15} /> CareerPilot analysis</div>
                  <h3 className="mt-2 text-2xl font-semibold">Three paths surfaced from your current signals.</h3>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
                    These are starting hypotheses, not a personality-test verdict. Your selection becomes a working goal that CareerPilot can continuously refine as you add evidence.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[.06] bg-black/15 px-4 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-700">Signals used</p>
                  <p className="mt-1 text-sm font-medium text-zinc-300">{interests.length + workStyle.length + 3} profile signals</p>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {visibleCareers.map((career) => {
                const Icon = career.icon;
                const selected = selectedCareer === career.title;
                return (
                  <article key={career.title} className={`rounded-3xl border p-5 transition ${selected ? "border-violet-400/35 bg-violet-400/[.055]" : "border-white/[.07] bg-white/[.025] hover:border-white/[.12]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-violet-400/15 text-violet-200" : "bg-white/[.05] text-zinc-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-700">Profile fit</p>
                        <p className="mt-1 text-lg font-semibold text-zinc-200">{career.fit}%</p>
                      </div>
                    </div>

                    <p className="mt-5 text-[10px] uppercase tracking-[.18em] text-zinc-700">{career.category}</p>
                    <h3 className="mt-1 text-xl font-semibold">{career.title}</h3>
                    <p className="mt-3 min-h-[48px] text-xs leading-5 text-zinc-500">{career.description}</p>

                    <div className="mt-5 border-t border-white/[.06] pt-5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-700">Why it appeared</p>
                      <ul className="mt-3 space-y-2">
                        {career.reasons.map((reason) => <li key={reason} className="flex gap-2 text-xs text-zinc-400"><Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />{reason}</li>)}
                      </ul>
                    </div>

                    <div className="mt-5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-700">Skills to strengthen</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {career.skills.map((skill) => <span key={skill} className="rounded-lg border border-white/[.06] px-2 py-1 text-[10px] text-zinc-500">{skill}</span>)}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <MiniStat icon={Clock3} value={career.time} />
                      <MiniStat icon={BriefcaseBusiness} value={career.demand} />
                    </div>

                    <button onClick={() => chooseCareer(career.title)} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${selected ? "bg-white text-black" : "border border-white/[.08] text-zinc-300 hover:bg-white/[.05]"}`}>
                      {selected ? <><Check size={14} /> Selected path</> : <>Explore this path <ArrowRight size={14} /></>}
                    </button>
                  </article>
                );
              })}
            </div>

            {selectedCareer && (
              <section className="mt-5 rounded-3xl border border-emerald-400/15 bg-emerald-400/[.035] p-6 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-200"><Target size={15} /> Proposed Career Goal</div>
                    <h3 className="mt-2 text-2xl font-semibold">{selectedCareer}</h3>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
                      Set this as your working target. CareerPilot will use it to generate your skill-gap analysis, roadmap, projects, job matches and interview preparation.
                    </p>
                  </div>
                  <button onClick={() => setGoalSaved(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black">
                    {goalSaved ? <><Check size={14} /> Goal saved</> : <>Set as career goal <ArrowRight size={14} /></>}
                  </button>
                </div>
                {goalSaved && (
                  <div className="mt-5 grid gap-3 border-t border-emerald-400/10 pt-5 sm:grid-cols-3">
                    <Next title="Next: Gap analysis" text="Compare your current evidence with role requirements." />
                    <Next title="Then: Roadmap" text="Turn missing skills into a sequence of practical milestones." />
                    <Next title="Later: Opportunities" text="Match your evolving profile to relevant jobs." />
                  </div>
                )}
              </section>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="text-xs text-zinc-600 hover:text-zinc-300">← Adjust profile signals</button>
              <a href="/dashboard" className="text-xs text-zinc-600 hover:text-white">Return to command center</a>
            </div>
          </>
        )}

        <footer className="py-8 text-center text-[10px] text-zinc-700">CareerPilot · Direction first, evidence next.</footer>
      </div>
    </main>
  );
}

function Choice({ children, active, onClick, compact = false }: { children: React.ReactNode; active: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border text-left transition ${compact ? "px-3 py-2.5 text-xs" : "p-4 text-sm"} ${active ? "border-violet-400/25 bg-violet-400/[.08] text-violet-100" : "border-white/[.06] bg-black/10 text-zinc-500 hover:border-white/[.12] hover:text-zinc-300"}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-violet-300 bg-violet-300 text-black" : "border-zinc-700"}`}>{active && <Check size={10} strokeWidth={3} />}</span>
      {children}
    </button>
  );
}

function SelectBlock({ label, value, options, onChange, icon: Icon }: { label: string; value: string; options: string[]; onChange: (v: string) => void; icon: typeof GraduationCapIcon }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-300">{label}</label>
      <div className="relative mt-3">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" />
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border border-white/[.07] bg-black/20 py-3 pl-9 pr-9 text-xs text-zinc-300 outline-none focus:border-violet-400/25">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700" />
      </div>
    </div>
  );
}

function Signal({ icon: Icon, title, value }: { icon: typeof Laptop; title: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><Icon size={14} className="text-zinc-700" /><p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-700">{title}</p><p className="mt-1 text-xs text-zinc-400">{value}</p></div>;
}

function MiniStat({ icon: Icon, value }: { icon: typeof Clock3; value: string }) {
  return <div className="rounded-xl border border-white/[.05] bg-black/10 p-3"><Icon size={13} className="text-zinc-700" /><p className="mt-2 text-[10px] leading-4 text-zinc-500">{value}</p></div>;
}

function Next({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-white/[.05] bg-black/10 p-4"><p className="text-xs font-medium text-zinc-300">{title}</p><p className="mt-2 text-[10px] leading-4 text-zinc-600">{text}</p></div>;
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M2.5 9.2 12 4l9.5 5.2L12 14.4 2.5 9.2Z" /><path d="M6.5 11.4v4.1c3.3 2.3 6.7 2.3 10 0v-4.1" /><path d="M21.5 9.3v6.2" /></svg>;
}
