import {
  ActionCategory,
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

function getRequirements(targetRole: string): RoleRequirement[] {
  return (
    ROLE_REQUIREMENTS[targetRole] ??
    [
      {
        skill: "Communication",
        importance: "high",
        targetLevel: 75,
      },
      {
        skill: "Problem Solving",
        importance: "high",
        targetLevel: 75,
      },
      {
        skill: "Domain Knowledge",
        importance: "medium",
        targetLevel: 65,
      },
    ]
  );
}

export function syncSkillRecords(state: CareerState): CareerState {
  const requirements = getRequirements(state.targetRole);

  const existing = state.skillRecords ?? [];

  const skillRecords: SkillRecord[] = requirements.map((requirement) => {
    const existingSkill = existing.find(
      (skill) =>
        skill.name.toLowerCase() === requirement.skill.toLowerCase(),
    );

    return {
      name: requirement.skill,
      currentLevel: existingSkill?.currentLevel ?? 0,
      targetLevel: requirement.targetLevel,
      verified: existingSkill?.verified ?? false,
      evidenceCount: existingSkill?.evidenceCount ?? 0,
    };
  });

  return {
    ...state,
    skillRecords,
    updatedAt: new Date().toISOString(),
  };
}

export function getSkillGapAnalysis(state: CareerState) {
  const requirements = getRequirements(state.targetRole);

  const skills = state.skillRecords ?? [];

  return requirements.map((requirement) => {
    const skill = skills.find(
      (item) =>
        item.name.toLowerCase() === requirement.skill.toLowerCase(),
    );

    const currentLevel = skill?.currentLevel ?? 0;
    const gap = Math.max(requirement.targetLevel - currentLevel, 0);

    return {
      skill: requirement.skill,
      importance: requirement.importance,
      currentLevel,
      targetLevel: requirement.targetLevel,
      gap,
      verified: skill?.verified ?? false,
      evidenceCount: skill?.evidenceCount ?? 0,
    };
  });
}

export function calculateSkillReadiness(state: CareerState): number {
  const analysis = getSkillGapAnalysis(state);

  if (analysis.length === 0) {
    return 0;
  }

  const weightedScore = analysis.reduce((total, item) => {
    const importanceWeight =
      item.importance === "high"
        ? 1
        : item.importance === "medium"
          ? 0.7
          : 0.4;

    const levelScore = Math.min(
      item.currentLevel / item.targetLevel,
      1,
    );

    return total + levelScore * importanceWeight;
  }, 0);

  const totalWeight = analysis.reduce((total, item) => {
    return (
      total +
      (item.importance === "high"
        ? 1
        : item.importance === "medium"
          ? 0.7
          : 0.4)
    );
  }, 0);

  return totalWeight === 0
    ? 0
    : Math.round((weightedScore / totalWeight) * 100);
}

export function calculateCareerReadiness(state: CareerState): number {
  const skillReadiness = calculateSkillReadiness(state);

  const verifiedSkills =
    (state.skillRecords ?? []).filter((skill) => skill.verified).length;

  const totalSkills = (state.skillRecords ?? []).length;

  const verificationScore =
    totalSkills === 0
      ? 0
      : (verifiedSkills / totalSkills) * 100;

  const evidenceScore =
    (state.evidence ?? []).length >= 2
      ? 100
      : (state.evidence ?? []).length * 50;

  const portfolioScore =
    (state.evidence ?? []).some(
      (item) => item.type === "project",
    )
      ? 100
      : 0;

  return Math.round(
    skillReadiness * 0.6 +
      verificationScore * 0.2 +
      evidenceScore * 0.1 +
      portfolioScore * 0.1,
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
      category: "discovery" as ActionCategory,
      priority: "high",
      reason:
        "CareerPilot needs a destination before it can calculate meaningful skill gaps.",
    };
  }

  const analysis = getSkillGapAnalysis(state);

  const unverifiedSkill = analysis.find(
    (item) =>
      item.currentLevel >= item.targetLevel * 0.8 &&
      !item.verified,
  );

  if (unverifiedSkill) {
    return {
      id: `verify-${unverifiedSkill.skill
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
      title: `Verify ${unverifiedSkill.skill}`,
      description:
        `Your ${unverifiedSkill.skill} level is close to the target. Complete a practical assessment to turn the skill into verified evidence.`,
      category: "evidence" as ActionCategory,
      priority: "high",
      reason:
        "You are close to the target level, but the skill currently lacks verification.",
    };
  }

  const largestGap = [...analysis]
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)[0];

  if (largestGap) {
    return {
      id: `build-${largestGap.skill
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
      title: `Build ${largestGap.skill}`,
      description:
        `Improve your ${largestGap.skill} capability to close one of the most important gaps for ${state.targetRole}.`,
      category: "skill" as ActionCategory,
      priority:
        largestGap.importance === "high"
          ? "high"
          : "medium",
      reason:
        `${largestGap.skill} is currently ${largestGap.currentLevel}% and the target level is ${largestGap.targetLevel}%.`,
    };
  }

  const projectEvidence = (state.evidence ?? []).filter(
    (item) => item.type === "project",
  );

  if (projectEvidence.length < 2) {
    return {
      id: "build-project",
      title: "Build a portfolio project",
      description:
        `Create a practical ${state.targetRole} project that demonstrates your skills with real evidence.`,
      category: "portfolio" as ActionCategory,
      priority: "high",
      reason:
        "Your skills are developing, but your portfolio needs stronger practical evidence.",
    };
  }

  return {
    id: "prepare-opportunities",
    title: "Prepare for matching opportunities",
    description:
      "Your core skills and evidence are in place. The next step is to prepare your resume and start targeting relevant opportunities.",
    category: "application" as ActionCategory,
    priority: "high",
    reason:
      "Your current career state is ready to move from capability building toward employment.",
  };
}

export function buildRoadmap(state: CareerState): RoadmapNode[] {
  const analysis = getSkillGapAnalysis(state);

  const nodes: RoadmapNode[] = [
    {
      id: "direction",
      title: "Career direction",
      category: "discovery",
      status: state.goalSet ? "completed" : "available",
      requiredSkills: [],
      evidenceRequired: false,
    },

    ...analysis.map((skill) => ({
      id: `skill-${skill.skill
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
      title: skill.skill,
      category:
        skill.verified
          ? ("evidence" as ActionCategory)
          : ("skill" as ActionCategory),
      status:
        skill.gap === 0 && skill.verified
          ? "completed"
          : skill.currentLevel > 0
            ? "in-progress"
            : "available",
      requiredSkills: [skill.skill],
      evidenceRequired: true,
    })),

    {
      id: "portfolio",
      title: "Build portfolio evidence",
      category: "portfolio",
      status:
        (state.evidence ?? []).filter(
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
      category: "application",
      status: "available",
      requiredSkills: [],
      evidenceRequired: true,
    },

    {
      id: "applications",
      title: "Target relevant opportunities",
      category: "application",
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

  return nodes;
}
