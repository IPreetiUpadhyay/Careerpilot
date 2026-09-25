"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  Search,
  Sparkles,
  Target,
  Upload,
  AlertCircle,
  TrendingUp,
  BriefcaseBusiness,
  Brain,
} from "lucide-react";

const analysisAreas = [
  {
    title: "ATS Compatibility",
    score: 86,
    description: "Structure, formatting and machine readability",
    status: "Strong",
  },
  {
    title: "Role Alignment",
    score: 72,
    description: "How closely your resume matches the target role",
    status: "Needs work",
  },
  {
    title: "Skills Evidence",
    score: 68,
    description: "Proof that your listed skills are actually demonstrated",
    status: "Needs work",
  },
  {
    title: "Impact & Achievements",
    score: 61,
    description: "Strength of measurable results and accomplishments",
    status: "Improve",
  },
];

const missingEvidence = [
  {
    skill: "Power BI",
    reason: "Listed as a skill but no project or work evidence found",
    priority: "High",
  },
  {
    skill: "SQL",
    reason: "Mentioned, but practical impact is not clearly demonstrated",
    priority: "High",
  },
  {
    skill: "Data Visualization",
    reason: "No measurable dashboard or visualization outcome detected",
    priority: "Medium",
  },
];

const suggestions = [
  "Add measurable outcomes to your most recent experience.",
  "Create a Power BI project and link it to your portfolio.",
  "Rewrite generic responsibility statements as achievement-focused bullets.",
];

export default function ResumeIntelligencePage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#090e17]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-blue-400">
              <Sparkles size={16} />
              Career Intelligence
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Resume Intelligence
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Turn your resume into evidence that supports your career goal.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500">
            <Upload size={17} />
            Upload Resume
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Hero workspace */}
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-[#0d1420] to-[#0b1018] p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                  <FileText size={22} />
                </div>

                <h2 className="text-2xl font-semibold">
                  Your resume is connected to your Career DNA
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  CareerPilot analyzes your resume against your target career,
                  verified skills, roadmap progress and real job requirements.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-right sm:block">
                <p className="text-xs text-slate-500">Resume readiness</p>
                <p className="mt-1 text-3xl font-semibold text-blue-400">
                  74%
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Target role
                  </p>
                  <p className="mt-1 font-medium">Data Analyst</p>
                </div>

                <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                  Change role
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["SQL", "Excel", "Power BI", "Python", "Data Analysis"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div className="rounded-3xl border border-white/10 bg-[#0d131d] p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Target size={17} />
              Overall role alignment
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-6xl font-semibold tracking-tight">
                74
              </span>
              <span className="mb-2 text-lg text-slate-500">/ 100</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[74%] rounded-full bg-blue-500" />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Your resume has a solid foundation, but stronger evidence for
              your target role could significantly improve alignment.
            </p>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium transition hover:bg-white/[0.07]">
              Compare with a job description
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Analysis */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-blue-400">Resume diagnostics</p>
              <h2 className="mt-1 text-xl font-semibold">
                What CareerPilot found
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              Last analyzed just now
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analysisAreas.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#0d131d] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <span className="text-2xl font-semibold text-blue-400">
                    {item.score}
                  </span>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence + Suggestions */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Missing evidence */}
          <div className="rounded-3xl border border-white/10 bg-[#0d131d] p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <AlertCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Evidence gaps</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Skills that need stronger proof in your resume or portfolio.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {missingEvidence.map((item) => (
                <div
                  key={item.skill}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.skill}</p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        item.priority === "High"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI suggestions */}
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] to-[#0d131d] p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Brain size={20} />
              </div>

              <div>
                <h2 className="font-semibold">CareerPilot suggestions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Actions generated from your current career state.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs text-blue-400">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-6 text-slate-300">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>

            <button className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
              Fix these gaps
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Job description matcher */}
        <section className="rounded-3xl border border-white/10 bg-[#0d131d] p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <BriefcaseBusiness size={17} />
                Job Match Intelligence
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Compare your resume with a real job
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Paste a job description and CareerPilot will identify matched
                skills, missing requirements, evidence gaps and the changes
                that matter most.
              </p>
            </div>

            <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-slate-200">
              <Search size={17} />
              Analyze Job Description
            </button>
          </div>
        </section>

        {/* Next best action */}
        <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 via-blue-500/[0.04] to-transparent p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <TrendingUp size={22} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                  Next Best Action
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Build evidence for Power BI
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This is currently one of the biggest gaps between your
                  Career DNA and your target role.
                </p>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500">
              Start Project
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Footer status */}
        <div className="flex items-center justify-center gap-2 pb-8 text-xs text-slate-600">
          <CheckCircle2 size={14} />
          Resume Intelligence is connected to your Career DNA
        </div>
      </div>
    </main>
  );
}
