"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  Globe2,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import { CareerState, defaultCareerState, loadCareerState, saveCareerState } from "../lib/career-state";

const roles = [
  { name: "Data Analyst", description: "Turn data into insights, dashboards and decisions.", skills: ["SQL", "Excel", "Power BI", "Python"] },
  { name: "Business Analyst", description: "Bridge business problems, data and practical solutions.", skills: ["Excel", "SQL", "Power BI", "Communication"] },
  { name: "Product Analyst", description: "Use product data to understand users and improve outcomes.", skills: ["SQL", "Python", "Analytics", "Experimentation"] },
  { name: "Data Scientist", description: "Build analytical and machine-learning solutions from data.", skills: ["Python", "SQL", "Statistics", "Machine Learning"] },
];

const modes = ["Hybrid / Remote", "Remote only", "On-site", "Flexible"];
const geographies = ["India", "India + International", "International / Relocation", "Remote worldwide"];

export default function CareerGoalPage() {
  const [state, setState] = useState<CareerState>(defaultCareerState);

  useEffect(() => {
    let cancelled = false;

    async function loadGoal() {
      setState(loadCareerState());

      try {
        const response = await fetch("/api/career-goals", { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/auth";
            return;
          }
          throw new Error("Could not load career goal.");
        }

        const result = await response.json();
        const active = result.goals?.find((goal: { status: string }) => goal.status === "active");

        if (!cancelled && active) {
          setGoalId(active.id);
          setState((current) => ({
            ...current,
            targetRole: active.targetRole ?? current.targetRole,
            workMode: active.workMode ?? current.workMode,
            geography: active.targetLocation ?? current.geography,
            goalSet: true,
          }));
        }
      } catch {
        if (!cancelled) setError("Could not load your saved career goal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGoal();
    return () => {
      cancelled = true;
    };
  }, []);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.name === state.targetRole) ?? roles[0],
    [state.targetRole]
  );

  function chooseRole(role: typeof roles[number]) {
    setState((current) => ({ ...current, targetRole: role.name, skills: role.skills }));
  }

  async function finish() {
    setSaving(true);
    setError("");

    const scope =
      state.geography === "India" ? "india" :
      state.geography === "International / Relocation" ? "international" :
      state.geography === "Remote worldwide" ? "remote-worldwide" : "both";

    const payload = {
      title: selectedRole.name,
      targetRole: selectedRole.name,
      targetLocation: state.geography,
      workMode: state.workMode,
      status: "active",
    };

    try {
      const response = await fetch("/api/career-goals", {
        method: goalId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalId ? { ...payload, id: goalId } : payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not save career goal.");

      const persistedGoal = result.goal;
      setGoalId(persistedGoal.id);

      const next: CareerState = {
        ...state,
        version: 2,
        goalSet: true,
        targetRole: selectedRole.name,
        skills: selectedRole.skills,
        profile: {
          ...state.profile,
          currentLocation: state.profile.currentLocation || "",
          education: state.profile.education || "",
          currentRole: state.profile.currentRole || "",
        },
        primaryGoal: {
          id: persistedGoal.id,
          role: selectedRole.name,
          type: "explore",
          seniority: "Entry-level",
          scope,
          workModes: state.workMode === "Remote only" ? ["remote"] :
            state.workMode === "On-site" ? ["onsite"] :
            state.workMode === "Hybrid / Remote" ? ["hybrid", "remote"] : ["flexible"],
          preferredLocations: state.geography ? [state.geography] : [],
          active: true,
          createdAt: persistedGoal.createdAt,
        },
      };

      saveCareerState(next);
      setState(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save career goal.");
    } finally {
      setSaving(false);
    }
  }

