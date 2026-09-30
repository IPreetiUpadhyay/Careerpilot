import { loadCareerState, saveCareerState } from "./career-state";
import { buildRoadmap, syncSkillRecords } from "./career-intelligence";
import type { SkillEvidenceType } from "./career-state";

export function refreshCareerIntelligence() {
  const state=syncSkillRecords(loadCareerState());
  const roadmap=buildRoadmap(state);
  const next={...state,roadmap,progress:{...state.progress,totalActions:roadmap.length,verifiedSkills:state.skillRecords.filter(s=>s.verified).length}};
  saveCareerState(next); return next;
}

export function recordCareerAction(actionId:string,xp=50) {
  const state=loadCareerState();
  const next={...state,lastActionId:actionId,progress:{...state.progress,completedActions:state.progress.completedActions+1,xp:state.progress.xp+xp}};
  saveCareerState(next); return next;
}

export function addSkillEvidence(input:{title:string;skillNames:string[];type:SkillEvidenceType;strength?:number}) {
  const state=loadCareerState();
  const strength=input.strength??80;
  const evidence={id:typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():String(Date.now()),type:input.type,title:input.title,skillNames:input.skillNames,strength,createdAt:new Date().toISOString()};
  const skills=state.skillRecords.map(skill=>input.skillNames.some(n=>n.toLowerCase()===skill.name.toLowerCase())?{...skill,verified:strength>=70||skill.verified,evidence:Array.from(new Set([...skill.evidence,input.type])),confidence:Math.max(skill.confidence,strength),lastUpdated:new Date().toISOString()}:skill);
  const next={...state,evidence:[...state.evidence,evidence],skillRecords:skills,progress:{...state.progress,xp:state.progress.xp+(input.type==="project"?150:100),completedProjects:state.progress.completedProjects+(input.type==="project"?1:0)}};
  saveCareerState({...next,roadmap:buildRoadmap(next)}); return next;
}
