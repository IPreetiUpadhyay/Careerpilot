import {
  CareerState,
  NextBestAction,
  RoadmapNode,
  SkillRecord,
} from "./career-state";

type RoleRequirement = {
  skill: string;
  importance: "high" | "medium" | "low";
  targetLevel: number;
};

const ROLE_REQUIREMENTS: Record<string, RoleRequirement[]> = {
  "Data Analyst": [
    { skill: "SQL", importance: "high", targetLevel: 80 },
    { skill: "Excel", importance: "high", targetLevel: 75 },
    { skill: "Power BI", importance: "high", targetLevel: 75 },
    { skill: "Python", importance: "medium", targetLevel: 60 },
    { skill: "Statistics", importance: "medium", targetLevel: 65 },
    { skill: "Data Visualization", importance: "high", targetLevel: 75 },
  ],
  "Business Analyst": [
    { skill: "Excel", importance: "high", targetLevel: 80 },
    { skill: "SQL", importance: "high", targetLevel: 70 },
    { skill: "Business Analysis", importance: "high", targetLevel: 80 },
    { skill: "Power BI", importance: "medium", targetLevel: 65 },
    { skill: "Communication", importance: "high", targetLevel: 80 },
  ],
  "Product Analyst": [
    { skill: "SQL", importance: "high", targetLevel: 80 },
    { skill: "Excel", importance: "medium", targetLevel: 70 },
    { skill: "Product Analytics", importance: "high", targetLevel: 80 },
    { skill: "Data Visualization", importance: "high", targetLevel: 75 },
    { skill: "Statistics", importance: "medium", targetLevel: 65 },
  ],
  "Data Scientist": [
    { skill: "Python", importance: "high", targetLevel: 85 },
    { skill: "SQL", importance: "high", targetLevel: 75 },
    { skill: "Statistics", importance: "high", targetLevel: 85 },
    { skill: "Machine Learning", importance: "high", targetLevel: 80 },
    { skill: "Data Visualization", importance: "medium", targetLevel: 70 },
  ],
};

const getRequirements = (role: string): RoleRequirement[] =>
  ROLE_REQUIREMENTS[role] ?? [
    { skill: "Communication", importance: "high", targetLevel: 75 },
    { skill: "Problem Solving", importance: "high", targetLevel: 75 },
    { skill: "Domain Knowledge", importance: "medium", targetLevel: 65 },
  ];

const slug = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "-");

const weight = (importance: RoleRequirement["importance"]) =>
  importance === "high" ? 1 : importance === "medium" ? 0.7 : 0.4;

export function syncSkillRecords(state: CareerState): CareerState {
  const requirements = getRequirements(state.targetRole);
  const existing = state.skillRecords ?? [];
  const now = new Date().toISOString();

  const skillRecords: SkillRecord[] = requirements.map((requirement) => {
    const previous = existing.find(
      (skill) =>
        skill.name.toLowerCase() === requirement.skill.toLowerCase(),
    );

    const selfReported = state.skills.some(
      (skill) =>
        skill.toLowerCase() === requirement.skill.toLowerCase(),
    );

    return {
      name: requirement.skill,
      currentLevel:
        previous?.currentLevel ?? (selfReported ? 30 : 0),
      targetLevel: requirement.targetLevel,
      confidence:
        previous?.confidence ?? (selfReported ? 35 : 0),
      evidence: previous?.evidence ?? [],
      verified: previous?.verified ?? false,
      lastUpdated: previous?.lastUpdated ?? now,
    };
  });

  return {
    ...state,
    skillRecords,
    updatedAt: now,
  };
}

export function getSkillGapAnalysis(state: CareerState) {
  const requirements = getRequirements(state.targetRole);

  return requirements.map((requirement) => {
    const skill = (state.skillRecords ?? []).find(
      (item) =>
        item.name.toLowerCase() === requirement.skill.toLowerCase(),
    );

    const currentLevel = skill?.currentLevel ?? 0;

    return {
      skill: requirement.skill,
      importance: requirement.importance,
      currentLevel,
      targetLevel: requirement.targetLevel,
      gap: Math.max(requirement.targetLevel - currentLevel, 0),
      verified: skill?.verified ?? false,
      evidenceCount: skill?.evidence.length ?? 0,
    };
  });
}

export function calculateSkillReadiness(state: CareerState): number {
  const analysis = getSkillGapAnalysis(state);

  if (!analysis.length) return 0;

  let score = 0;
  let total = 0;

  for (const item of analysis) {
    const itemWeight = weight(item.importance);

    score +=
      Math.min(item.currentLevel / item.targetLevel, 1) *
      itemWeight;

    total += itemWeight;
  }

  return total ? Math.round((score / total) * 100) : 0;
}

export function calculateCareerReadiness(state: CareerState): number {
  const skillReadiness = calculateSkillReadiness(state);
  const records = state.skillRecords ?? [];

  const verified =
    records.length === 0
      ? 0
      : (records.filter((skill) => skill.verified).length /
          records.length) *
        100;

  const evidence = Math.min(state.evidence.length * 50, 100);

  const portfolio = state.evidence.some(
    (item) => item.type === "project",
  )
    ? 100
    : 0;

  return Math.round(
    skillReadiness * 0.6 +
      verified * 0.2 +
      evidence * 0.1 +
      portfolio * 0.1,
  );
}

export function getNextBestAction(
  state: CareerState,
): NextBestAction {
  if (!state.goalSet || !state.primaryGoal) {
    return {
      id: "career-direction",
      title: "Choose your career direction",
      description:
        "Set a clear target so CareerPilot can build your personalized career path.",
      category: "discovery",
      priority: "high",
      impact: 90,
      estimatedMinutes: 5,
      reason:
        "CareerPilot needs a destination before it can calculate meaningful skill gaps.",
      destination: "/career-goal",
    };
  }

  const analysis = getSkillGapAnalysis(state);

  const verify = analysis.find(
    (item) =>
      item.currentLevel >= item.targetLevel * 0.8 &&
      !item.verified,
  );

  if (verify) {
    return {
      id: `verify-${slug(verify.skill)}`,
      title: `Verify ${verify.skill}`,
      description: `Complete a practical assessment to turn your ${verify.skill} signal into verified evidence.`,
      category: "evidence",
      priority: "high",
      impact: 85,
      estimatedMinutes: 30,
      reason:
        "The skill is close to the target but currently lacks verification.",
      destination: "/skills-gap",
    };
  }

  const largestGap = [...analysis]
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)[0];

  if (largestGap) {
    return {
      id: `build-${slug(largestGap.skill)}`,
      title: `Build ${largestGap.skill}`,
      description: `Improve ${largestGap.skill} to close an important gap for ${state.targetRole}.`,
      category: "skill",
      priority:
        largestGap.importance === "high" ? "high" : "normal",
      impact: largestGap.importance === "high" ? 90 : 70,
      estimatedMinutes: 45,
      reason: `${largestGap.skill} is ${largestGap.currentLevel}% versus a ${largestGap.targetLevel}% target.`,
      destination: "/skills-gap",
    };
  }

  const projects = state.evidence.filter(
    (item) => item.type === "project",
  ).length;

  if (projects < 2) {
    return {
      id: "build-project",
      title: "Build a portfolio project",
      description: `Create a practical ${state.targetRole} project that demonstrates your skills with evidence.`,
      category: "project",
      priority: "high",
      impact: 85,
      estimatedMinutes: 90,
      reason:
        "Your core skill gaps are currently closed, so practical evidence is the next constraint.",
      destination: "/dashboard",
    };
  }

  return {
    id: "prepare-opportunities",
    title: "Prepare for matching opportunities",
    description:
      "Prepare your resume and target relevant opportunities.",
    category: "application",
    priority: "high",
    impact: 90,
    estimatedMinutes: 30,
    reason:
      "Your current career state is ready to move toward employment.",
    destination: "/resume-intelligence",
  };
}

export function buildRoadmap(
  state: CareerState,
): RoadmapNode[] {
  const analysis = getSkillGapAnalysis(state);

  return [
    {
      id: "direction",
      title: "Career direction",
      category: "discovery",
      status: state.goalSet ? "completed" : "available",
      requiredSkills: [],
      evidenceRequired: false,
    },

    ...analysis.map(
      (skill): RoadmapNode => ({
        id: `skill-${slug(skill.skill)}`,
        title: skill.skill,
        category: skill.verified ? "evidence" : "skill",
        status:
          skill.gap === 0 && skill.verified
            ? "completed"
            : skill.currentLevel > 0
              ? "in-progress"
              : "available",
        requiredSkills: [skill.skill],
        evidenceRequired: true,
      }),
    ),

    {
      id: "portfolio",
      title: "Build portfolio evidence",
      category: "project",
      status:
        state.evidence.filter(
          (item) => item.type === "project",
        ).length >= 2
          ? "completed"
          : "available",
      requiredSkills: analysis
        .filter((item) => item.currentLevel >= 60)
        .map((item) => item.skill),
      evidenceRequired: true,
    },

    {
      id: "resume",
      title: "Prepare your resume",
      category: "resume",
      status: "available",
      requiredSkills: [],
      evidenceRequired: true,
    },

    {
      id: "applications",
      title: "Target relevant opportunities",
      category: "job-search",
      status: "available",
      requiredSkills: [],
      evidenceRequired: true,
    },

    {
      id: "interviews",
      title: "Prepare for interviews",
      category: "interview",
      status: "available",
      requiredSkills: [],
      evidenceRequired: true,
    },
  ];
}
