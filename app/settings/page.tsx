"use client";

import { FormEvent, useEffect, useState } from "react";

type Preferences = {
  emailNotifications: boolean;
  jobAlerts: boolean;
  interviewReminders: boolean;
  weeklyDigest: boolean;
};

const defaults: Preferences = {
  emailNotifications: true,
  jobAlerts: true,
  interviewReminders: true,
  weeklyDigest: true,
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState(defaults);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verified = new URLSearchParams(window.location.search).get("verified");
    if (verified === "1") setMessage("Email verified and updated successfully.");
    if (verified === "0") setError("That email verification link is invalid or expired.");

    fetch("/api/account", { cache: "no-store" }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setUser(data.user);
      setEmail(data.user.email);
      setPreferences({ ...defaults, ...(data.user.preferences ?? {}) });
    }).catch(e => setError(e.message));
  }, []);

  async function update(body: Record<string, unknown>) {
    setMessage(""); setError("");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not save changes.");
      return null;
    }
    setUser(data.user);
    return data.user;
  }

  async function savePreferences(e: FormEvent) {
    e.preventDefault();
    const updated = await update({ preferences });
    if (updated) setMessage("Preferences saved.");
  }

  async function changeEmail(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "Could not update email.");
    setUser(data.user);
    setCurrentPassword("");
    setMessage(data.emailVerificationRequired
      ? "Verification email sent. Your current email stays active until you verify the new address."
      : "Email updated."
    );
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    const updated = await update({ newPassword, currentPassword });
    if (updated) {
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07080c] text-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <a href="/dashboard" className="text-sm text-white/50 hover:text-white">← Back to Command Center</a>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-violet-300/80">Account settings</p>
          <h1 className="mt-2 text-4xl font-semibold">Settings</h1>
          <p className="mt-2 text-white/50">Control your CareerPilot account, notifications and security.</p>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <form onSubmit={savePreferences} className="mt-5 space-y-4">
            {(Object.keys(defaults) as (keyof Preferences)[]).map(key => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <span>
                  <span className="block">{key === "emailNotifications" ? "Email notifications" : key === "jobAlerts" ? "Job alerts" : key === "interviewReminders" ? "Interview reminders" : "Weekly career digest"}</span>
                  <span className="text-sm text-white/40">Receive useful CareerPilot updates for this category.</span>
                </span>
                <input type="checkbox" checked={preferences[key]} onChange={e => setPreferences(p => ({ ...p, [key]: e.target.checked }))} className="h-5 w-5 accent-violet-400" />
              </label>
            ))}
            <button className="rounded-xl bg-white px-5 py-3 font-medium text-black">Save preferences</button>
          </form>
        </section>

        <section id="email" className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Email address</h2>
          <p className="mt-1 text-sm text-white/40">Changing your email requires your current password.</p>
          <form onSubmit={changeEmail} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" required className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
            <button className="rounded-xl bg-white px-5 py-3 font-medium text-black md:col-span-2">Update email</button>
          </form>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Password & security</h2>
          <p className="mt-1 text-sm text-white/40">Use a strong password with at least 8 characters.</p>
          <form onSubmit={changePassword} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" required className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" minLength={8} required className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400" />
            <button className="rounded-xl bg-white px-5 py-3 font-medium text-black md:col-span-2">Change password</button>
          </form>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Session</h2>
          <p className="mt-1 text-sm text-white/40">Sign out of this CareerPilot session.</p>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/auth"; }} className="mt-4 rounded-xl border border-red-400/30 px-5 py-3 text-red-300 hover:bg-red-400/10">Sign out</button>
        </section>

        {(error || message) && <p className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>{error || message}</p>}
      </div>
    </main>
  );
}
