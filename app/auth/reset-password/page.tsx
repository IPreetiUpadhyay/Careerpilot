"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!token) return setError("This reset link is missing or invalid.");
    if (password !== confirm) return setError("The passwords do not match.");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Could not reset password.");
      else {
        setSuccess(data.message || "Password updated.");
        setTimeout(() => router.push("/auth"), 1400);
      }
    } catch {
      setError("Could not connect to CareerPilot.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#07080d] px-5 py-8 text-white">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.035] p-7 sm:p-9">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><LockKeyhole size={20}/></div>
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Use at least 8 characters. Your reset link expires after 30 minutes.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-xs text-zinc-400">NEW PASSWORD
          <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/20 px-3">
            <input type={show ? "text" : "password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" className="w-full bg-transparent py-3.5 text-sm text-white outline-none"/>
            <button type="button" onClick={() => setShow(v => !v)} aria-label={show ? "Hide password" : "Show password"} className="text-zinc-500">{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
          </div>
        </label>
        <label className="block text-xs text-zinc-400">CONFIRM NEW PASSWORD
          <input type={show ? "text" : "password"} minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Re-enter new password" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3.5 text-sm text-white outline-none"/>
        </label>
        {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}
        {success && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">{success}</p>}
        <button disabled={busy || !token} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-50">{busy ? <Loader2 size={17} className="animate-spin"/> : <>Update password <ArrowRight size={17}/></>}</button>
      </form>
    </section>
  </main>;
}
