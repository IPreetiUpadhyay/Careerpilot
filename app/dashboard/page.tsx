"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  FolderKanban,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import {
  CareerState,
  loadCareerState,
} from "../lib/career-state";

import {
  calculateCareerReadiness,
  getNextBestAction,
  getSkillGapAnalysis,
  buildRoadmap,
  syncSkillRecords,
} from "../lib/career-intelligence";

const nav = [
  ["Overview", LayoutDashboard, "/dashboard"],
  ["Career DNA", BrainCircuit, "/career-dna"],
  ["Career Goal", Target, "/career-goal"],
  ["Roadmap", Compass, "/dashboard"],
  ["Skills", Gauge, "/skills-gap"],
  ["Learning", BookOpen, "/learning"],
  ["Projects", FolderKanban, "/dashboard"],
  ["Resume", FileText, "/resume-intelligence"],
  ["Jobs", BriefcaseBusiness, "/dashboard"],
  ["Applications", CheckCircle2, "/dashboard"],
  ["Interview Arena", MessageCircle, "/dashboard"],
] as const;

export default function Dashboard() {
  const [state, setState] = useState<CareerState | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const current = loadCareerState();
      const synced = syncSkillRecords(current);

      setState(synced);
    };

    refresh();

    window.addEventListener(
      "careerpilot-state-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "careerpilot-state-updated",
        refresh,
      );
    };
  }, []);

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-zinc-100">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Zap size={18} fill="currentColor" />
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Building your CareerPilot...
          </p>
        </div>
      </main>
    );
  }

  return (
    <DashboardContent
      state={state}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    />
  );
}

function DashboardContent({
  state,
  mobileOpen,
  setMobileOpen,
}: {
  state: CareerState;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}) {
  const readiness = calculateCareerReadiness(state);

  const action = getNextBestAction(state);

  const skillAnalysis = getSkillGapAnalysis(state);

  const roadmap = buildRoadmap(state);

  const completedRoadmap = roadmap.filter(
    (node) => node.status === "completed",
  ).length;

  const roadmapProgress =
    roadmap.length > 0
      ? Math.round(
          (completedRoadmap / roadmap.length) * 100,
        )
      : 0;

  const verifiedSkills = skillAnalysis.filter(
    (skill) => skill.verified,
  ).length;

  const totalSkills = skillAnalysis.length;

  const projects = state.evidence.filter(
    (item) => item.type === "project",
  ).length;

  const name =
    state.profile.name?.trim() ||
    state.careerStage ||
    "Explorer";

  const greetingName =
    name.length > 20
      ? name.split(" ")[0]
      : name;

  const topGaps = [...skillAnalysis]
    .filter((skill) => skill.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4);

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[18%] top-[-12%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-500/[.07] blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/[.07] bg-[#0a0b10]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col px-4 py-5">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                  <Zap size={18} fill="currentColor" />
                </div>

                <div>
                  <div className="text-[15px] font-semibold">
                    CareerPilot
                  </div>

                  <div className="text-[10px] uppercase tracking-[.18em] text-zinc-600">
                    Career OS
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="text-zinc-500 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-1">
              {nav.map(([label, Icon, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    label === "Overview"
                      ? "bg-white/[.08] text-white"
                      : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200"
                  }`}
                >
                  <Icon
                    size={17}
                    className={
                      label === "Overview"
                        ? "text-violet-300"
                        : "text-zinc-600"
                    }
                  />

                  <span>{label}</span>

                  {label === "Skills" &&
                    totalSkills > 0 && (
                      <span className="ml-auto rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] text-violet-300">
                        {totalSkills}
                      </span>
                    )}
                </a>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="mb-4 rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/10 to-cyan-400/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                  <Sparkles size={14} />
                  CareerPilot AI
                </div>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Your career intelligence layer is ready.
                </p>

                <button className="mt-3 text-xs text-zinc-300">
                  Open mentor{" "}
                  <ArrowUpRight
                    className="inline"
                    size={13}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-300 text-xs font-bold text-black">
                  {getInitials(
                    state.profile.name,
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {state.careerStage ||
                      "Explorer"}
                  </p>

                  <p className="text-[11px] text-zinc-600">
                    {state.progress.xp} XP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <button
            onClick={() =>
              setMobileOpen(false)
            }
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            aria-label="Close menu"
          />
        )}

        {/* MAIN */}
        <section className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-white/[.07] bg-[#08090d]/80 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setMobileOpen(true)
                }
                className="rounded-xl border border-white/[.08] p-2 text-zinc-400 lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div>
                <p className="text-xs text-zinc-600">
                  Career Command Center
                </p>

                <p className="hidden text-sm font-medium sm:block">
                  {state.targetRole ||
                    "Define your direction"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="relative p-2.5 text-zinc-500">
                <Bell size={18} />

                {action && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </button>

              <button className="p-2.5 text-zinc-500">
                <Settings size={18} />
              </button>

              <div className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[.06] text-xs sm:flex">
                {getInitials(
                  state.profile.name,
                )}
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9">
            {/* INTRO */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.18em] text-violet-300">
                  {today}
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
                  Good morning,{" "}
                  {greetingName}.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                  CareerPilot has turned your profile
                  into a live career state. Here's what
                  matters next.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-xs text-zinc-400">
                  {state.progress.xp} XP
                </div>

                <a
                  href="/career-goal"
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black"
                >
                  Update goal
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* NEXT ACTION + READINESS */}
            <div className="grid gap-4 xl:grid-cols-[1.45fr_.8fr_.8fr]">
              <section className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.12] via-white/[.035] to-cyan-400/[.05] p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                  <Target size={15} />
                  Next best action
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-[28px]">
                  {action.title}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                  {action.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={action.destination}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black"
                  >
                    Take action
                    <ChevronRight size={15} />
                  </a>

                  <span className="text-xs text-zinc-600">
                    ~{action.estimatedMinutes} min
                    {" · "}
                    {action.impact}% impact
                  </span>
                </div>

                <p className="mt-5 max-w-xl text-[11px] leading-5 text-zinc-600">
                  Why this? {action.reason}
                </p>
              </section>

              <Stat
                label="Career readiness"
                value={`${readiness}%`}
                detail={
                  readiness >= 70
                    ? "Strong foundation"
                    : readiness >= 40
                      ? "Building foundation"
                      : "Early stage"
                }
                icon={TrendingUp}
              />

              <Stat
                label="Verified skills"
                value={`${verifiedSkills}/${totalSkills}`}
                detail={
                  totalSkills === 0
                    ? "No skill map yet"
                    : `${verifiedSkills} verified`
                }
                icon={Trophy}
                progress={
                  totalSkills
                    ? Math.round(
                        (verifiedSkills /
                          totalSkills) *
                          100,
                      )
                    : 0
                }
              />
            </div>

            {/* CAREER STATE + SKILLS */}
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.16em] text-zinc-600">
                      Career State
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      {state.targetRole ||
                        "No target role yet"}
                    </h2>
                  </div>

                  <a
                    href="/career-dna"
                    className="text-xs text-zinc-500"
                  >
                    View profile{" "}
                    <ChevronRight
                      className="inline"
                      size={14}
                    />
                  </a>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Metric
                    icon={Target}
                    label="Target role"
                    value={
                      state.targetRole ||
                      "Not set"
                    }
                  />

                  <Metric
                    icon={Globe2}
                    label="Opportunity scope"
                    value={
                      state.geography ||
                      "Not set"
                    }
                  />

                  <Metric
                    icon={BriefcaseBusiness}
                    label="Experience"
                    value={
                      state.experience ||
                      "Not set"
                    }
                  />

                  <Metric
                    icon={UserRound}
                    label="Career stage"
                    value={
                      state.careerStage ||
                      "Explorer"
                    }
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-white/[.06] bg-black/10 p-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">
                      Career progress
                    </span>

                    <b className="text-zinc-300">
                      {roadmapProgress}%
                    </b>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-white/[.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{
                        width: `${roadmapProgress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-zinc-600">
                    {completedRoadmap} of{" "}
                    {roadmap.length} roadmap
                    milestones completed.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.16em] text-zinc-600">
                      Skill intelligence
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Your skill map
                    </h2>
                  </div>

                  <a
                    href="/skills-gap"
                    className="text-xs text-zinc-500"
                  >
                    Open skill gaps
                  </a>
                </div>

                <div className="mt-6 space-y-5">
                  {skillAnalysis.length === 0 ? (
                    <EmptyState
                      text="Set a career goal to generate your first skill map."
                    />
                  ) : (
                    skillAnalysis
                      .slice(0, 5)
                      .map((skill) => (
                        <SkillBar
                          key={skill.skill}
                          name={skill.skill}
                          level={skill.currentLevel}
                          target={skill.targetLevel}
                          verified={
                            skill.verified
                          }
                        />
                      ))
                  )}
                </div>
              </section>
            </div>

            {/* GAPS + ROADMAP */}
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.16em] text-zinc-600">
                      Gap intelligence
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      What is holding you back?
                    </h2>
                  </div>

                  <a
                    href="/skills-gap"
                    className="text-xs text-zinc-500"
                  >
                    View all{" "}
                    <ArrowUpRight
                      className="inline"
                      size={13}
                    />
                  </a>
                </div>

                <div className="mt-5 space-y-2">
                  {topGaps.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[.04] p-5">
                      <p className="text-sm font-medium text-emerald-200">
                        No major skill gaps detected.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        CareerPilot can now focus on
                        evidence, projects and
                        opportunities.
                      </p>
                    </div>
                  ) : (
                    topGaps.map((gap) => (
                      <div
                        key={gap.skill}
                        className="flex items-center gap-4 rounded-2xl border border-white/[.05] bg-black/10 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[.07] text-violet-300">
                          <Gauge size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {gap.skill}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {gap.currentLevel}% current
                            {" · "}
                            {gap.targetLevel}%
                            target
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-violet-300">
                            -{gap.gap}
                          </p>

                          <p className="text-[10px] uppercase tracking-wider text-zinc-700">
                            gap
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.16em] text-zinc-600">
                      Career roadmap
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Your path
                    </h2>
                  </div>

                  <span className="text-xs text-violet-300">
                    {completedRoadmap}/
                    {roadmap.length}
                  </span>
                </div>

                <div className="mt-6">
                  {roadmap
                    .slice(0, 6)
                    .map((node, index) => (
                      <div
                        key={node.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex w-5 flex-col items-center">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              node.status ===
                              "completed"
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                : node.status ===
                                    "in-progress"
                                  ? "border-violet-400/30 bg-violet-400/10 text-violet-300"
                                  : "border-white/10 text-zinc-700"
                            }`}
                          >
                            {node.status ===
                            "completed" ? (
                              <CheckCircle2
                                size={12}
                              />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                          </div>

                          {index <
                            Math.min(
                              roadmap.length,
                              6,
                            ) -
                              1 && (
                            <div className="h-7 w-px bg-white/[.07]" />
                          )}
                        </div>

                        <span
                          className={`text-xs ${
                            node.status ===
                            "completed"
                              ? "text-zinc-400"
                              : node.status ===
                                  "in-progress"
                                ? "text-violet-200"
                                : "text-zinc-600"
                          }`}
                        >
                          {node.title}
                        </span>
                      </div>
                    ))}
                </div>

                <a
                  href="/dashboard"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.07] py-2.5 text-xs text-zinc-400"
                >
                  Continue roadmap
                  <ArrowUpRight size={13} />
                </a>
              </section>
            </div>

            {/* EVIDENCE */}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Action
                icon={FileText}
                title="Strengthen your resume"
                text="Turn verified skills and evidence into stronger role-aligned resume signals."
                href="/resume-intelligence"
              />

              <Action
                icon={FolderKanban}
                title="Build portfolio evidence"
                text={
                  projects === 0
                    ? "You don't have a project recorded yet. Build one to create career evidence."
                    : `${projects} project${projects === 1 ? "" : "s"} currently strengthen your profile.`
                }
                href="/dashboard"
              />

              <Action
                icon={MessageCircle}
                title="Practice your interview"
                text="Use your target role and current skill state to prepare for interviews."
                href="/dashboard"
              />
            </div>

            <footer className="mt-8 flex justify-between border-t border-white/[.06] py-6 text-[11px] text-zinc-700">
              <span>
                CareerPilot · Discover. Build. Prove. Move.
              </span>

              <span className="hidden sm:block">
                Recommendations are generated from your
                current Career State.
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ----------------------------- */
/* Components                    */
/* ----------------------------- */

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  progress,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
      <div className="flex justify-between">
        <span className="text-xs text-zinc-600">
          {label}
        </span>

        <Icon
          size={16}
          className="text-zinc-600"
        />
      </div>

      <div className="mt-5 text-4xl font-semibold">
        {value}
      </div>

      <p className="mt-2 text-xs text-emerald-300/80">
        {detail}
      </p>

      {typeof progress === "number" && (
        <div className="mt-5 h-1.5 rounded-full bg-white/[.06]">
          <div
            className="h-full rounded-full bg-violet-400"
            style={{
              width: `${Math.min(
                Math.max(progress, 0),
                100,
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Compass;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[.05] bg-black/10 p-3.5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-700">
        <Icon size={12} />
        {label}
      </div>

      <p className="mt-2 text-xs font-medium text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function SkillBar({
  name,
  level,
  target,
  verified,
}: {
  name: string;
  level: number;
  target: number;
  verified: boolean;
}) {
  const percentage =
    target > 0
      ? Math.min(
          Math.round((level / target) * 100),
          100,
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-300">
            {name}
          </span>

          {verified && (
            <span className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">
              verified
            </span>
          )}
        </div>

        <span className="text-zinc-600">
          {level}% / {target}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[.06]">
        <div
          className={`h-full rounded-full ${
            verified
              ? "bg-emerald-400"
              : "bg-violet-400"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function Action({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: typeof FileText;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-white/[.07] bg-white/[.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/[.12]"
    >
      <div className="flex justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.06]">
          <Icon
            size={16}
            className="text-zinc-400"
          />
        </div>

        <ArrowUpRight
          size={15}
          className="text-zinc-700"
        />
      </div>

      <h3 className="mt-4 text-sm font-medium">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-zinc-600">
        {text}
      </p>
    </a>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[.05] bg-black/10 p-5">
      <p className="text-xs leading-5 text-zinc-600">
        {text}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  if (!name?.trim()) return "P";

  const parts = name
    .trim()
    .split(/\s+/)
    .slice(0, 2);

  return parts
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
