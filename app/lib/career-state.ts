export type CareerGoalType = "first-job" | "grow" | "switch" | "explore" | "international";
export type OpportunityScope = "india" | "international" | "both" | "remote-worldwide";
export type WorkMode = "remote" | "hybrid" | "onsite" | "flexible";
export type SkillEvidenceType = "self-report" | "assessment" | "challenge" | "project" | "work" | "certification" | "interview";

export type OpportunityRecord = { id: string; title: string; company: string; location: string; workMode: "remote" | "hybrid" | "onsite"; employmentType: "full-time" | "part-time" | "contract" | "internship"; scope: "india" | "international" | "remote-worldwide"; skills: string[]; experience: string; salary?: string; sponsorship?: "yes" | "no" | "unknown"; source: string; url: string; saved: boolean; };

export type ProjectRecord = { id: string; title: string; description: string; skills: string[]; difficulty: "Beginner" | "Intermediate" | "Advanced"; status: "saved" | "in-progress" | "completed"; milestones: { id: string; title: string; completed: boolean }[]; createdAt: string; completedAt?: string; };
export type ActionCategory = "discovery" | "skill" | "learning" | "evidence" | "project" | "resume" | "job-search" | "application" | "interview" | "profile";
export type ActionPriority = "critical" | "high" | "normal";

export type SkillRecord = {
  name: string; currentLevel: number; targetLevel: number; confidence: number;
  evidence: SkillEvidenceType[]; verified: boolean; lastUpdated: string;
};

export type EvidenceRecord = {
  id: string; type: SkillEvidenceType; title: string;
  skillNames: string[]; strength: number; createdAt: string;
};

export type CareerGoal = {
  id: string; role: string; type: CareerGoalType; seniority: string;
  scope: OpportunityScope; workModes: WorkMode[];
  preferredLocations: string[]; active: boolean; createdAt: string;
};

export type RoadmapNode = {
  id: string; title: string; category: ActionCategory;
  status: "locked" | "available" | "in-progress" | "completed";
  requiredSkills?: string[]; dependsOn?: string[]; evidenceRequired?: boolean;
};

export type NextBestAction = {
  id: string; title: string; description: string; category: ActionCategory;
  priority: ActionPriority; impact: number; estimatedMinutes: number;
  reason: string; destination: string;
};

export type CareerState = {
  version: number; targetRole: string; careerStage: string; experience: string;
  workMode: string; geography: string; skills: string[]; goalSet: boolean;
  profile: { name: string; currentLocation: string; education: string; currentRole: string };
  primaryGoal: CareerGoal | null; skillRecords: SkillRecord[]; evidence: EvidenceRecord[]; projects: ProjectRecord[]; opportunities: OpportunityRecord[];
  roadmap: RoadmapNode[];
  progress: { completedActions: number; totalActions: number; completedProjects: number; verifiedSkills: number; applications: number; interviews: number; xp: number };
  lastActionId: string | null; updatedAt: string;
};

export const defaultCareerState: CareerState = {
  version: 2, targetRole: "", careerStage: "Explorer", experience: "",
  workMode: "", geography: "", skills: [], goalSet: false,
  profile: { name: "", currentLocation: "", education: "", currentRole: "" },
  primaryGoal: null, skillRecords: [], evidence: [], projects: [], opportunities: [], roadmap: [],
  progress: { completedActions: 0, totalActions: 0, completedProjects: 0, verifiedSkills: 0, applications: 0, interviews: 0, xp: 0 },
  lastActionId: null, updatedAt: new Date(0).toISOString(),
};

const KEY = "careerpilot-career-state-v2";
const LEGACY = "careerpilot-career-state";

export function loadCareerState(): CareerState {
  if (typeof window === "undefined") return defaultCareerState;
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(LEGACY);
    if (!raw) return defaultCareerState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultCareerState,
      ...parsed,
      profile: { ...defaultCareerState.profile, ...(parsed.profile ?? {}) },
      progress: { ...defaultCareerState.progress, ...(parsed.progress ?? {}) },
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
    };
  } catch {
    return defaultCareerState;
  }
}

export function saveCareerState(state: CareerState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.localStorage.setItem(LEGACY, JSON.stringify(next));
  window.dispatchEvent(new Event("careerpilot-state-updated"));
}
