"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to CareerPilot.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-5 py-8 text-[#f7f7fb]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
          <section className="hidden border-r border-white/10 p-12 lg:block">
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <BriefcaseBusiness size={21} />
              </div>
              <span className="text-lg font-semibold">CareerPilot</span>
            </div>
            <p className="mb-5 text-sm font-medium text-violet-300">YOUR CAREER, MAPPED.</p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.05] tracking-tight">
              Build a career that moves with you.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
              Your Career DNA, skills, projects, opportunities and progress in one intelligent career system.
            </p>
            <div className="mt-12 space-y-4 text-sm text-zinc-300">
              {["Personal career intelligence", "Skills → projects → evidence", "Jobs, applications and interviews"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 flex rounded-xl border border-white/10 bg-black/20 p-1">
              {(["register", "login"] as const).map((item) => (
                <button key={item} onClick={() => { setMode(item); setError(""); }} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${mode === item ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
                  {item === "register" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold">{mode === "register" ? "Start your CareerPilot" : "Welcome back"}</h2>
              <p className="mt-2 text-sm text-zinc-400">
                {mode === "register" ? "Create your account and start building your career profile." : "Continue where you left off."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-zinc-400">NAME</span>
                  <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-3">
                    <UserRound size={17} className="text-zinc-500" />
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-zinc-600" />
                  </div>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-400">EMAIL</span>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-3">
                  <Mail size={17} className="text-zinc-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-zinc-600" />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-400">PASSWORD</span>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-3">
                  <LockKeyhole size={17} className="text-zinc-500" />
                  <input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 8 characters" className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-zinc-600" />
                </div>
              </label>

              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}

              <button disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60">
                {busy ? <Loader2 size={17} className="animate-spin" /> : <>{mode === "register" ? "Create my account" : "Sign in"}<ArrowRight size={17} /></>}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
