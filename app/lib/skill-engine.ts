import type { CareerState } from "./career-state";

export type SkillPriority = "Critical" | "High" | "Medium";
export type SkillAnalysis = { name: string; current: number; required: number; evidence: string; category: string; priority: SkillPriority; action: string; reason: string };
type Requirement = { name: string; required: number; category: string; action: string; reason: string; evidence: string };

const roleRequirements: Record<string, Requirement[]> = {
  "Data Analyst": [
    { name: "SQL", required: 85, category: "Core", action: "Complete an advanced SQL challenge", reason: "SQL is a core analytical workflow for extracting and transforming business data.", evidence: "Assessment + project" },
    { name: "Excel", required: 75, category: "Core", action: "Build a spreadsheet analysis project", reason: "Spreadsheet analysis is useful for fast exploration, reporting and stakeholder work.", evidence: "Project evidence" },
    { name: "Python", required: 70, category: "Technical", action: "Complete a Python data-analysis challenge", reason: "Python expands your ability to clean, analyze and automate beyond spreadsheet workflows.", evidence: "Practical challenge" },
    { name: "Power BI", required: 75, category: "Technical", action: "Build a Power BI dashboard project", reason: "Dashboard evidence makes analytical output easier for employers to evaluate.", evidence: "Portfolio project" },
    { name: "Statistics", required: 70, category: "Core", action: "Complete a statistics assessment", reason: "Statistics supports sound interpretation of trends and analytical results.", evidence: "Assessment" },
    { name: "Data Visualization", required: 70, category: "Portfolio", action: "Create an insight-led dashboard", reason: "Employers need to see that you can turn analysis into understandable decisions.", evidence: "Portfolio project" },
    { name: "Communication", required: 65, category: "Professional", action: "Practice explaining one analysis in plain language", reason: "Analysts need to communicate findings to people who may not work directly with data.", evidence: "Interview / presentation" },
    { name: "Problem Solving", required: 70, category: "Professional", action: "Complete a business case challenge", reason: "A strong analyst connects a business question to evidence, analysis and an action.", evidence: "Case challenge" },
  ],
  "Business Analyst": [
    { name: "Excel", required: 80, category: "Core", action: "Build a business analysis workbook", reason: "Spreadsheet modeling and analysis are common parts of business analysis work.", evidence: "Project evidence" },
    { name: "SQL", required: 70, category: "Technical", action: "Complete an SQL fundamentals challenge", reason: "SQL helps you independently interrogate business data.", evidence: "Assessment" },
    { name: "Power BI", required: 70, category: "Technical", action: "Build a KPI dashboard", reason: "Visualization helps turn business data into decision-ready views.", evidence: "Portfolio project" },
    { name: "Communication", required: 85, category: "Professional", action: "Practice a stakeholder requirements interview", reason: "Requirements gathering and stakeholder communication are central to the role.", evidence: "Practical simulation" },
    { name: "Problem Solving", required: 80, category: "Professional", action: "Complete a business case challenge", reason: "Business analysts translate ambiguous problems into structured solutions.", evidence: "Case challenge" },
  ],
  "Product Analyst": [
    { name: "SQL", required: 85, category: "Core", action: "Complete an advanced product SQL challenge", reason: "Product analytics depends heavily on querying behavioral and business data.", evidence: "Assessment + project" },
    { name: "Python", required: 70, category: "Technical", action: "Build a product-analysis notebook", reason: "Python supports deeper analysis and experimentation workflows.", evidence: "Portfolio project" },
    { name: "Analytics", required: 80, category: "Core", action: "Analyze a product funnel dataset", reason: "Funnel, retention and cohort thinking are useful evidence for product analytics.", evidence: "Practical project" },
    { name: "Experimentation", required: 75, category: "Core", action: "Complete an A/B testing case", reason: "Experiment design and interpretation help evaluate product changes.", evidence: "Case challenge" },
    { name: "Communication", required: 70, category: "Professional", action: "Present a product insight memo", reason: "Product analysts need to make analytical findings actionable for teams.", evidence: "Presentation evidence" },
  ],
  "Data Scientist": [
    { name: "Python", required: 90, category: "Technical", action: "Complete an end-to-end Python modeling project", reason: "Python is a primary implementation skill for data-science workflows.", evidence: "Portfolio project" },
    { name: "SQL", required: 80, category: "Core", action: "Complete an advanced SQL challenge", reason: "Data scientists often need to source and shape production data.", evidence: "Assessment + project" },
    { name: "Statistics", required: 85, category: "Core", action: "Complete a statistics assessment", reason: "Statistical reasoning underpins model evaluation and experimental thinking.", evidence: "Assessment" },
    { name: "Machine Learning", required: 85, category: "Technical", action: "Build and evaluate a machine-learning project", reason: "Practical modeling evidence is more informative than a self-reported skill alone.", evidence: "Portfolio project" },
    { name: "Communication", required: 65, category: "Professional", action: "Explain one model to a non-technical audience", reason: "Model value depends on communicating assumptions, limitations and implications.", evidence: "Presentation evidence" },
  ],
};

const fallbackRequirements: Requirement[] = [
  { name: "SQL", required: 75, category: "Core", action: "Complete an SQL fundamentals challenge", reason: "SQL is a broadly useful analytical skill and a strong starting point for evidence.", evidence: "Assessment" },
  { name: "Communication", required: 70, category: "Professional", action: "Practice a structured interview response", reason: "Clear communication strengthens most professional roles.", evidence: "Interview evidence" },
  { name: "Problem Solving", required: 70, category: "Professional", action: "Complete a role-relevant case challenge", reason: "Problem-solving evidence shows how you approach unfamiliar work.", evidence: "Case challenge" },
];

const baselineBySkill: Record<string, number> = { SQL: 68, Excel: 72, Python: 52, "Power BI": 28, Statistics: 61, "Data Visualization": 45, Communication: 68, "Problem Solving": 63, Analytics: 48, Experimentation: 35, "Machine Learning": 30 };

export function buildSkillAnalysis(state: CareerState): SkillAnalysis[] {
  const requirements = roleRequirements[state.targetRole] ?? fallbackRequirements;
  const userSkills = new Set(state.skills.map((skill) => skill.toLowerCase()));
  return requirements.map((requirement) => {
    const explicitlyAdded = userSkills.has(requirement.name.toLowerCase());
    const current = explicitlyAdded ? (baselineBySkill[requirement.name] ?? 55) : Math.max((baselineBySkill[requirement.name] ?? 35) - 10, 15);
    const gap = Math.max(requirement.required - current, 0);
    const priority: SkillPriority = gap >= 35 ? "Critical" : gap >= 15 ? "High" : "Medium";
    return { ...requirement, current, priority };
  });
}

export function getSkillSummary(skills: SkillAnalysis[]) {
  if (!skills.length) return { readiness: 0, gaps: 0, critical: 0 };
  const readiness = Math.round((skills.reduce((total, skill) => total + Math.min(skill.current / skill.required, 1), 0) / skills.length) * 100);
  return { readiness, gaps: skills.filter((skill) => skill.current < skill.required).length, critical: skills.filter((skill) => skill.priority === "Critical").length };
}
