"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  CircleAlert,
  Gauge,
  Layers3,
  Sparkles,
  Target,
  ShieldCheck,
  FolderKanban,
} from "lucide-react";

import {
  CareerState,
  loadCareerState,
} from "../lib/career-state";

import {
  calculateCareerReadiness,
  calculateSkillReadiness,
  getNextBestAction,
  getSkillGapAnalysis,
  syncSkillRecords,
} from "../lib/career-intelligence";

type Filter = "All" | "High" | "Medium" | "Verified";

export default function SkillsGapPage() {
  const [state, setState] =
    useState<CareerState | null>(null);

  const [filter, setFilter] =
    useState<Filter>("All");

  const [selectedSkill, setSelectedSkill] =
    useState("");

  const [recordedActions, setRecordedActions] = useState<string[]>([]);
  const [assessmentScore, setAssessmentScore] = useState("");
  const [assessmentSaving, setAssessmentSaving] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const current = syncSkillRecords(loadCareerState());
      try {
        const response = await fetch("/api/skills-gap", { cache: "no-store" });
        const result = await response.json();
        if (response.ok && Array.isArray(result.analysis)) {
          const records = result.analysis.map((item: any) => ({
            name: item.skill,
            currentLevel: Number(item.currentLevel || 0),
            targetLevel: Number(item.targetLevel || 0),
            confidence: item.verified ? 80 : item.currentLevel > 0 ? 35 : 0,
            evidence: Array.from({ length: Number(item.evidenceCount || 0) }, () => ({ type: "assessment" })),
            verified: Boolean(item.verified),
            lastUpdated: new Date().toISOString(),
          }));
          setState({ ...current, skillRecords: records });
        } else {
          setState(current);
        }
      } catch {
        setState(current);
      }
    };

    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const analysis = useMemo(() => {
    if (!state) return [];

    return getSkillGapAnalysis(
      syncSkillRecords(state),
    );
  }, [state]);

  useEffect(() => {
    if (!analysis.length) return;

    const exists = analysis.some(
      (item) => item.skill === selectedSkill,
    );

    if (!exists) {
      const firstGap = [...analysis]
        .filter((item) => item.gap > 0)
        .sort((a, b) => b.gap - a.gap)[0];

      setSelectedSkill(
        firstGap?.skill ?? analysis[0].skill,
      );
    }
  }, [analysis, selectedSkill]);

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-zinc-100">
        <p className="text-sm text-zinc-500">
          Loading Skill Intelligence...
        </p>
      </main>
    );
  }

  if (!state.goalSet || !state.targetRole) {
    return <NoCareerGoal />;
  }

  const selected =
    analysis.find(
      (item) => item.skill === selectedSkill,
    ) ?? analysis[0];

  const filtered = analysis.filter((skill) => {
    if (filter === "All") return true;

    if (filter === "Verified") {
      return skill.verified;
    }

    return (
      skill.importance.toLowerCase() ===
      filter.toLowerCase()
    );
  });

  const skillReadiness =
    calculateSkillReadiness(state);

  const careerReadiness =
    calculateCareerReadiness(state);

  const verifiedCount = analysis.filter(
    (skill) => skill.verified,
  ).length;

  const gapCount = analysis.filter(
    (skill) => skill.gap > 0,
  ).length;

  const highPriorityGaps = analysis.filter(
    (skill) =>
      skill.gap > 0 &&
      skill.importance === "high",
  ).length;

  const nextAction =
    getNextBestAction(state);

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[-15%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute right-[-10%] top-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">

        {/* HEADER */}

        <header className="flex items-center justify-between border-b border-white/[.07] pb-6">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Command Center
          </a>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black">
              <BrainCircuit size={16} />
            </span>

            CareerPilot
          </div>

          <span className="text-xs text-zinc-600">
            Skill Intelligence
          </span>
        </header>

        {/* HERO */}

        <section className="py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
                <Sparkles size={14} />
                Career Intelligence
              </div>

              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
                Build the skills that move you toward{" "}
                <span className="text-violet-300">
                  {state.targetRole}
                </span>
                .
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                CareerPilot compares your current skill
                signals with the requirements of your
                target career and identifies where your
                next effort will have the most impact.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">
                Target career
              </p>

              <p className="mt-2 font-medium">
                {state.targetRole}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {state.geography}
                {" · "}
                {state.workMode}
              </p>
            </div>
          </div>
        </section>

        {/* TOP METRICS */}

        <section className="grid gap-4 md:grid-cols-4">

          <Metric
            icon={Gauge}
            label="Skill readiness"
            value={`${skillReadiness}%`}
            description="Against role requirements"
          />

          <Metric
            icon={Target}
            label="Career readiness"
            value={`${careerReadiness}%`}
            description="Across current evidence"
          />

          <Metric
            icon={CircleAlert}
            label="Skill gaps"
            value={`${gapCount}`}
            description={`${highPriorityGaps} high priority`}
          />

          <Metric
            icon={ShieldCheck}
            label="Verified"
            value={`${verifiedCount}/${analysis.length}`}
            description="Skills with evidence"
          />

        </section>

        {/* MAIN */}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_.85fr]">

          {/* SKILL MAP */}

          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-zinc-600">
                  Skill map
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Your career skill profile
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Current signal compared with the target
                  level for {state.targetRole}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All",
                    "High",
                    "Medium",
                    "Verified",
                  ] as Filter[]
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      filter === item
                        ? "bg-white text-black"
                        : "border border-white/[.08] bg-white/[.025] text-zinc-500 hover:bg-white/[.06]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>

            <div className="mt-6 space-y-2">

              {filtered.map((skill) => {
                const active =
                  selected?.skill === skill.skill;

                const progress =
                  skill.targetLevel > 0
                    ? Math.min(
                        Math.round(
                          (skill.currentLevel /
                            skill.targetLevel) *
                            100,
                        ),
                        100,
                      )
                    : 0;

                return (
                  <button
                    key={skill.skill}
                    onClick={() =>
                      setSelectedSkill(
                        skill.skill,
                      )
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-violet-400/25 bg-violet-400/[.05]"
                        : "border-white/[.05] bg-black/10 hover:border-white/[.1] hover:bg-white/[.025]"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[.05] text-zinc-500">
                        <Layers3 size={16} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-medium">
                            {skill.skill}
                          </span>

                          <Importance
                            value={
                              skill.importance
                            }
                          />

                          {skill.verified && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                              <Check size={10} />
                              Verified
                            </span>
                          )}

                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.06]">

                          <div
                            className={`h-full rounded-full transition-all ${
                              skill.verified
                                ? "bg-emerald-400"
                                : "bg-gradient-to-r from-violet-500 to-cyan-400"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="mt-2 flex justify-between text-[10px] text-zinc-600">

                          <span>
                            Current{" "}
                            {skill.currentLevel}%
                          </span>

                          <span>
                            Target{" "}
                            {skill.targetLevel}%
                          </span>

                        </div>

                      </div>

                      <div className="hidden text-right sm:block">

                        <p className="text-sm font-semibold">
                          {skill.gap > 0
                            ? `-${skill.gap}`
                            : "Ready"}
                        </p>

                        <p className="text-[10px] uppercase tracking-wider text-zinc-700">
                          {skill.gap > 0
                            ? "gap"
                            : "level"}
                        </p>

                      </div>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

          {/* SELECTED SKILL */}

          {selected && (
            <aside className="rounded-3xl border border-violet-400/15 bg-gradient-to-b from-violet-500/[.09] via-white/[.025] to-white/[.015] p-6">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-[10px] uppercase tracking-[.18em] text-violet-300">
                    Selected skill
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {selected.skill}
                  </h2>
                </div>

                <Importance
                  value={
                    selected.importance
                  }
                />

              </div>

              {/* LEVEL */}

              <div className="mt-7 rounded-2xl border border-white/[.07] bg-black/10 p-4">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-xs text-zinc-600">
                      Current signal
                    </p>

                    <p className="mt-1 text-3xl font-semibold">
                      {selected.currentLevel}%
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-600">
                      Target
                    </p>

                    <p className="mt-1 text-lg font-medium text-zinc-300">
                      {selected.targetLevel}%
                    </p>
                  </div>

                </div>

                <div className="mt-4 h-2 rounded-full bg-white/[.06]">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                    style={{
                      width: `${Math.min(
                        (selected.currentLevel /
                          selected.targetLevel) *
                          100,
                        100,
                      )}%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex justify-between text-[10px] text-zinc-600">

                  <span>
                    Current
                  </span>

                  <span>
                    {selected.gap > 0
                      ? `${selected.gap} points to close`
                      : "Target reached"}
                  </span>

                </div>

              </div>

              {/* WHY */}

              <div className="mt-4 rounded-2xl border border-white/[.07] bg-black/10 p-4">

                <p className="text-[10px] uppercase tracking-[.16em] text-zinc-700">
                  Why this matters
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {getSkillExplanation(
                    selected.importance,
                    selected.gap,
                    selected.skill,
                    state.targetRole,
                  )}
                </p>

              </div>

              {/* EVIDENCE */}

              <div className="mt-4 grid grid-cols-2 gap-3">

                <SmallStat
                  label="Evidence"
                  value={`${selected.evidenceCount}`}
                  icon={FolderKanban}
                />

                <SmallStat
                  label="Verified"
                  value={
                    selected.verified
                      ? "Yes"
                      : "No"
                  }
                  icon={ShieldCheck}
                />

              </div>

              {/* ACTION */}

              <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.035] p-4">

                <p className="text-[10px] uppercase tracking-[.16em] text-cyan-300">
                  Recommended next step
                </p>

                <p className="mt-2 text-sm font-medium">
                  {getSkillAction(
                    selected.skill,
                    selected.gap,
                    selected.verified,
                  )}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  CareerPilot will eventually connect this
                  action directly to Learning, Assessments
                  and Projects.
                </p>

              </div>

              <div className="mt-5 rounded-2xl border border-white/[.07] bg-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[.16em] text-zinc-600">Quick assessment</p>
                <div className="mt-3 flex gap-2">
                  <input value={assessmentScore} onChange={(e) => setAssessmentScore(e.target.value)} type="number" min="0" max="100" placeholder="Score 0–100" className="h-10 flex-1 rounded-xl border border-white/[.1] bg-white/[.03] px-3 text-sm outline-none placeholder:text-zinc-700" />
                  <button
                    disabled={assessmentSaving}
                    onClick={async () => {
                      const score = Number(assessmentScore);
                      if (!Number.isFinite(score) || score < 0 || score > 100) return;
                      setAssessmentSaving(true);
                      try {
                        const response = await fetch("/api/skills-gap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skill: selected.skill, score }) });
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error);
                        setRecordedActions((current) => current.includes(selected.skill) ? current : [...current, selected.skill]);
                        setAssessmentScore("");
                        window.dispatchEvent(new Event("careerpilot-state-updated"));
                      } finally { setAssessmentSaving(false); }
                    }}
                    className="rounded-xl bg-white px-4 text-xs font-semibold text-black"
                  >{assessmentSaving ? "Saving..." : "Save assessment"}</button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!recordedActions.includes(selected.skill)) {
                    setRecordedActions((current) => [...current, selected.skill]);
                  }
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-100"
              >
                {recordedActions.includes(
                  selected.skill,
                ) ? (
                  <>
                    <CheckCircle2 size={16} />
                    Action recorded
                  </>
                ) : (
                  <>
                    Record as next action
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </aside>
          )}

        </section>

        {/* NEXT BEST ACTION */}

        <section className="mt-6 rounded-3xl border border-cyan-300/10 bg-gradient-to-r from-cyan-300/[.05] to-violet-500/[.04] p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-cyan-300">
                  CareerPilot recommendation
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {nextAction.title}
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
                  {nextAction.description}
                </p>
              </div>

            </div>

            <div className="shrink-0">

              <a
                href={nextAction.destination}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black"
              >
                Take action
                <ArrowRight size={14} />
              </a>

              <p className="mt-2 text-center text-[10px] text-zinc-700">
                {nextAction.estimatedMinutes} min
                {" · "}
                {nextAction.impact}% impact
              </p>

            </div>

          </div>

        </section>

        {/* EXPLANATION */}

        <section className="mt-6 rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[.05] text-zinc-500">
              <BrainCircuit size={17} />
            </div>

            <div>

              <p className="text-[10px] uppercase tracking-[.18em] text-zinc-700">
                How CareerPilot thinks
              </p>

              <h2 className="mt-1 text-sm font-semibold">
                Skills are only one part of career readiness.
              </h2>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-600">
                CareerPilot separates your skill signal from
                your evidence. A strong self-reported skill
                is not treated the same as a skill demonstrated
                through a project, assessment, work experience
                or other evidence. As we build the Learning,
                Project and Verification engines, these signals
                will continuously update your Career State.
              </p>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="flex justify-between border-t border-white/[.06] py-7 text-[10px] text-zinc-700">

          <span>
            CareerPilot · Discover. Build. Prove. Move.
          </span>

          <span className="hidden sm:block">
            Skill intelligence is generated from your
            current Career State.
          </span>

        </footer>

      </div>
    </main>
  );
}

/* -------------------------------- */
/* Supporting components             */
/* -------------------------------- */

function NoCareerGoal() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-zinc-100">

      <div className="max-w-lg">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
          <Target size={18} />
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[.18em] text-violet-300">
          Skill Intelligence
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-.035em]">
          Give CareerPilot a destination first.
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Your target career gives CareerPilot the
          requirements it needs to calculate meaningful
          skill gaps and recommendations.
        </p>

        <a
          href="/career-goal"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
        >
          Set career goal
          <ArrowRight size={16} />
        </a>

      </div>

    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5">

      <div className="flex items-center gap-2 text-zinc-600">
        <Icon size={15} />

        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  );
}

function SmallStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[.06] bg-black/10 p-3">

      <div className="flex items-center gap-2 text-zinc-700">
        <Icon size={12} />

        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-zinc-300">
        {value}
      </p>

    </div>
  );
}

function Importance({
  value,
}: {
  value: "high" | "medium" | "low";
}) {
  const styles = {
    high: "bg-amber-300/10 text-amber-300",
    medium: "bg-slate-400/10 text-slate-400",
    low: "bg-zinc-400/10 text-zinc-500",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[value]}`}
    >
      {value}
    </span>
  );
}

function getSkillExplanation(
  importance: "high" | "medium" | "low",
  gap: number,
  skill: string,
  role: string,
) {
  if (gap <= 0) {
    return `${skill} is currently at or above the target signal for ${role}. The next opportunity is to strengthen the evidence behind this skill.`;
  }

  if (importance === "high") {
    return `${skill} is a high-priority requirement for ${role}. Closing this ${gap}-point gap can materially strengthen your role readiness.`;
  }

  if (importance === "medium") {
    return `${skill} supports your ${role} profile. The current ${gap}-point gap is worth addressing after the higher-priority requirements.`;
  }

  return `${skill} is useful supporting knowledge for ${role}. It should be developed after the core requirements are stronger.`;
}

function getSkillAction(
  skill: string,
  gap: number,
  verified: boolean,
) {
  if (verified && gap <= 0) {
    return `Strengthen your ${skill} evidence with another practical project or work example.`;
  }

  if (gap > 20) {
    return `Build your ${skill} foundation, then prove it through a practical project or assessment.`;
  }

  if (gap > 0) {
    return `Close the remaining ${skill} gap and complete a practical assessment to verify it.`;
  }

  return `Create evidence that demonstrates your ${skill} ability.`;
}
