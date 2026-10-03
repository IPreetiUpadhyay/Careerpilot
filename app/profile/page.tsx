"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  email: string;
  name: string;
  phone: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setUser(data.user);
        setName(data.user.name ?? "");
        setPhone(data.user.phone ?? "");
      })
      .catch((e) => setError(e.message));
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMessage(""); setError("");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, currentPassword: password }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "Could not save changes.");
    setUser(data.user);
    setPassword("");
    setMessage("Profile updated.");
  }

  return (
    <main className="min-h-screen bg-[#07080c] text-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <a href="/dashboard" className="text-sm text-white/50 hover:text-white">← Back to Command Center</a>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-violet-300/80">Account</p>
          <h1 className="mt-2 text-4xl font-semibold">Your profile</h1>
          <p className="mt-2 text-white/50">Manage the personal information connected to your CareerPilot account.</p>
        </div>

        <form onSubmit={saveProfile} className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <label className="block">
            <span className="text-sm text-white/60">Full name</span>
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="text-sm text-white/60">Email</span>
            <input value={user?.email ?? ""} disabled className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white/40" />
            <a href="/settings#email" className="mt-2 inline-block text-sm text-violet-300">Change email in Settings →</a>
          </label>
          <label className="block">
            <span className="text-sm text-white/60">Phone number</span>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="text-sm text-white/60">Current password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Required only when changing protected account details" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
          </label>

          {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}
          <button className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-white/90">Save profile</button>
        </form>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/50">Member since</p>
          <p className="mt-1">{user ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
        </section>
      </div>
    </main>
  );
}
