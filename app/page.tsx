import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  Compass,
  FileText,
  Globe2,
  Layers3,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  { icon: Compass, title: "Discover your direction", text: "Turn your interests, experience and goals into realistic career paths." },
  { icon: BrainCircuit, title: "Build your Career DNA", text: "A living professional profile that grows as you learn, build and work." },
  { icon: TrendingUp, title: "See your skill gaps", text: "Know what matters for your target role and what evidence you still need." },
  { icon: BriefcaseBusiness, title: "Find better opportunities", text: "Explore local, international, remote and flexible work in one place." },
  { icon: FileText, title: "Become application-ready", text: "Align your resume and portfolio with the roles you actually want." },
  { icon: Target, title: "Always know what is next", text: "CareerPilot turns progress into a clear next best action." },
];

const journey = ["Career DNA", "Career Goal", "Skill Gap", "Roadmap", "Portfolio", "Jobs", "Interviews"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grid-bg pointer-events-none fixed inset-0 -z-10" />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-violet-500/20">
            <Zap size={19} fill="currentColor" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CareerPilot</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#vision" className="transition hover:text-white">Vision</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-xl px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white sm:block">
            Sign in
          </button>
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200">
            Get started
          </button>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-300">
            <Sparkles size={15} className="text-violet-300" />
            AI-powered career intelligence
          </div>

          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
            Your career,
            <span className="block bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
              mapped.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            CareerPilot brings career discovery, skill building, portfolios, jobs,
            applications and interview preparation into one intelligent journey.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] sm:w-auto">
              Build my Career DNA
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button className="w-full rounded-2xl border border-white/10 px-6 py-3.5 font-medium text-zinc-200 transition hover:bg-white/5 sm:w-auto">
              Explore CareerPilot
            </button>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="glass rounded-[28px] p-3 shadow-2xl shadow-violet-950/30">
            <div className="rounded-[22px] border border-white/5 bg-[#0b0c12] p-5 sm:p-7">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Career command center</p>
                  <h2 className="mt-1 text-xl font-semibold">Good morning, Explorer.</h2>
                </div>
                <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 sm:block">
                  72% career readiness
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.35fr_.65fr]">
                <div className="rounded-2xl border border-white/8 bg-white/[.035] p-5">
                  <div className="flex items-center gap-2 text-sm text-violet-300">
                    <Target size={16} />
                    Next best action
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">Complete your SQL assessment</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                    SQL is the largest unverified skill affecting your Data Analyst goal.
                  </p>
                  <button className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black">
                    Continue assessment <ArrowRight size={16} />
                  </button>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[.035] p-5">
                  <p className="text-sm text-zinc-500">Career progress</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl font-semibold">68%</span>
                    <span className="mb-1 text-sm text-zinc-500">to Job Ready</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {journey.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 rounded-full border border-white/7 bg-white/[.025] px-3 py-2 text-xs text-zinc-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] text-zinc-300">
                      {i + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-white/6 bg-white/[.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3 lg:px-8">
          {[
            ["01", "Understand", "CareerPilot builds a living picture of where you are and where you want to go."],
            ["02", "Close the gap", "Your roadmap connects skills, learning, projects and evidence into one progression."],
            ["03", "Move forward", "When you're ready, opportunities, applications and interviews become part of the same loop."],
          ].map(([n, title, text]) => (
            <div key={n}>
              <span className="text-xs font-semibold tracking-[0.2em] text-violet-300">{n}</span>
              <h3 className="mt-3 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-6 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-violet-300">One career operating system</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            From “What should I do?” to “I’m ready.”
          </h2>
          <p className="mt-5 leading-7 text-zinc-500">
            No disconnected tools. Every meaningful action improves your career profile,
            evidence, readiness and next recommendation.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/[.07]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8">
                <Icon size={20} />
              </div>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="vision" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/[.035] to-cyan-400/10 p-8 sm:p-12">
          <Globe2 className="absolute -right-8 -top-8 h-48 w-48 text-white/[.035]" />
          <Layers3 className="absolute -bottom-8 -left-8 h-40 w-40 text-white/[.025]" />
          <div className="relative max-w-2xl">
            <p className="text-sm text-cyan-300">The CareerPilot vision</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your career should feel like a journey, not a pile of tabs.
            </h2>
            <p className="mt-5 leading-7 text-zinc-400">
              CareerPilot connects decisions, learning, evidence and opportunities so
              progress compounds instead of disappearing between platforms.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-zinc-300">
              {["Career DNA", "AI Mentor", "Skill Graph", "Job Intelligence", "Interview Arena"].map((x) => (
                <span key={x} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-4 py-2">
                  <Check size={14} className="text-emerald-300" />
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-zinc-600 sm:flex-row">
          <span>© 2026 CareerPilot</span>
          <span>Discover. Build. Prove. Move.</span>
        </div>
      </footer>
    </main>
  );
}
