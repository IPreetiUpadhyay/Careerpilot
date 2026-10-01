import { CareerState } from "./career-state";

export type CareerGraphNode = {
  id: string;
  label: string;
  type: "role" | "skill" | "project" | "evidence" | "opportunity" | "application" | "goal";
  strength: number;
};

export type CareerGraphEdge = {
  from: string;
  to: string;
  relation: "requires" | "demonstrates" | "supports" | "targets" | "applied-to" | "builds";
};

export function buildCareerGraph(state: CareerState) {
  const nodes: CareerGraphNode[] = [];
  const edges: CareerGraphEdge[] = [];
  const add = (node: CareerGraphNode) => { if (!nodes.some(n => n.id === node.id)) nodes.push(node); };
  const roleId = "role:" + (state.targetRole || "career-direction");

  add({ id: roleId, label: state.targetRole || "Career direction", type: "role", strength: 100 });

  for (const skill of state.skillRecords ?? []) {
    const id = "skill:" + skill.name.toLowerCase();
    add({ id, label: skill.name, type: "skill", strength: skill.currentLevel });
    edges.push({ from: roleId, to: id, relation: "requires" });
  }

  for (const project of state.projects ?? []) {
    const projectId = "project:" + project.id;
    add({ id: projectId, label: project.title, type: "project", strength: project.status === "completed" ? 100 : 50 });
    for (const skill of project.skills) {
      const skillId = "skill:" + skill.toLowerCase();
      add({ id: skillId, label: skill, type: "skill", strength: 50 });
      edges.push({ from: projectId, to: skillId, relation: "demonstrates" });
    }
  }

  for (const evidence of state.evidence ?? []) {
    const evidenceId = "evidence:" + evidence.id;
    add({ id: evidenceId, label: evidence.title, type: "evidence", strength: evidence.strength });
    for (const skill of evidence.skillNames) {
      const skillId = "skill:" + skill.toLowerCase();
      add({ id: skillId, label: skill, type: "skill", strength: 50 });
      edges.push({ from: evidenceId, to: skillId, relation: "supports" });
    }
  }

  for (const opportunity of state.opportunities ?? []) {
    if (!opportunity.saved) continue;
    const opportunityId = "opportunity:" + opportunity.id;
    add({ id: opportunityId, label: opportunity.title + " · " + opportunity.company, type: "opportunity", strength: 60 });
    edges.push({ from: roleId, to: opportunityId, relation: "targets" });
    for (const skill of opportunity.skills) {
      const skillId = "skill:" + skill.toLowerCase();
      add({ id: skillId, label: skill, type: "skill", strength: 50 });
      edges.push({ from: opportunityId, to: skillId, relation: "requires" });
    }
  }

  for (const application of state.applications ?? []) {
    const applicationId = "application:" + application.id;
    add({ id: applicationId, label: application.title + " · " + application.company, type: "application", strength: application.stage === "offer" ? 100 : 60 });
    const opportunityId = application.opportunityId ? "opportunity:" + application.opportunityId : null;
    if (opportunityId) edges.push({ from: applicationId, to: opportunityId, relation: "applied-to" });
  }

  if (state.primaryGoal) {
    const goalId = "goal:" + state.primaryGoal.id;
    add({ id: goalId, label: state.primaryGoal.role, type: "goal", strength: 100 });
    edges.push({ from: goalId, to: roleId, relation: "targets" });
  }

  return { nodes, edges };
}
