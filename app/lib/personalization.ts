import { CareerState } from "./career-state";
import { calculateCareerReadiness, calculateSkillReadiness, getSkillGapAnalysis, getRecommendations } from "./career-intelligence";

export type PersonalizationProfile = {
  preferredFocus: "skill" | "evidence" | "job-search" | "interview" | "career-edge";
  confidence: number;
  reasons: string[];
  context: {
    targetRole: string;
    readiness: number;
    skillReadiness: number;
    activeApplications: number;
    completedProjects: number;
    interviewSessions: number;
  };
};

export function buildPersonalization(state: CareerState): PersonalizationProfile {
  const gaps = getSkillGapAnalysis(state);
  const recommendations = getRecommendations(state);
  const readiness = calculateCareerReadiness(state);
  const skillReadiness = calculateSkillReadiness(state);
  const activeApplications = state.applications.filter(a => !["rejected", "withdrawn", "offer"].includes(a.stage)).length;
  const projects = state.progress.completedProjects;
  const interviews = state.interviews.length;

  let preferredFocus: PersonalizationProfile["preferredFocus"] = "skill";
  const reasons: string[] = [];

  if (!state.goalSet || !state.primaryGoal) {
    preferredFocus = "skill";
    reasons.push("A clear career goal is not set yet.");
  } else if (gaps.some(g => g.gap > 0 && g.importance === "high")) {
    preferredFocus = "skill";
    reasons.push("High-importance skill gaps are still open.");
  } else if (projects < 2) {
    preferredFocus = "evidence";
    reasons.push("More practical evidence would strengthen the profile.");
  } else if (activeApplications === 0 && readiness >= 50) {
    preferredFocus = "job-search";
    reasons.push("Your current readiness supports starting an opportunity pipeline.");
  } else if (activeApplications > 0 && interviews === 0) {
    preferredFocus = "interview";
    reasons.push("You have application activity but no recorded interview practice.");
  } else {
    preferredFocus = "career-edge";
    reasons.push("Core readiness signals are established, so continued growth can focus on staying current.");
  }

  const confidence = Math.min(100, Math.round(45 + Math.min(gaps.length * 5, 25) + (state.primaryGoal ? 15 : 0) + (state.skillRecords.length ? 15 : 0)));

  return {
    preferredFocus,
    confidence,
    reasons,
    context: {
      targetRole: state.targetRole,
      readiness,
      skillReadiness,
      activeApplications,
      completedProjects: projects,
      interviewSessions: interviews,
    },
  };
}
