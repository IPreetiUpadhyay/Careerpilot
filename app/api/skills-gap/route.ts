import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const ROLES:Record<string,{skill:string;target:number;importance:"high"|"medium"|"low"}[]>={
 "Data Analyst":[{skill:"SQL",target:80,importance:"high"},{skill:"Excel",target:75,importance:"high"},{skill:"Power BI",target:75,importance:"high"},{skill:"Python",target:60,importance:"medium"},{skill:"Statistics",target:65,importance:"medium"},{skill:"Data Visualization",target:75,importance:"high"}],
 "Business Analyst":[{skill:"Excel",target:80,importance:"high"},{skill:"SQL",target:70,importance:"high"},{skill:"Business Analysis",target:80,importance:"high"},{skill:"Power BI",target:65,importance:"medium"},{skill:"Communication",target:80,importance:"high"}],
 "Product Analyst":[{skill:"SQL",target:80,importance:"high"},{skill:"Excel",target:70,importance:"medium"},{skill:"Product Analytics",target:80,importance:"high"},{skill:"Data Visualization",target:75,importance:"high"},{skill:"Statistics",target:65,importance:"medium"}],
 "Data Scientist":[{skill:"Python",target:85,importance:"high"},{skill:"SQL",target:75,importance:"high"},{skill:"Statistics",target:85,importance:"high"},{skill:"Machine Learning",target:80,importance:"high"},{skill:"Data Visualization",target:70,importance:"medium"}]
};
const fallback=[{skill:"Communication",target:75,importance:"high" as const},{skill:"Problem Solving",target:75,importance:"high" as const},{skill:"Domain Knowledge",target:65,importance:"medium" as const}];

export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{
  const p=await db.query("select target_role,preferences from career_profiles where user_id=$1",[s.userId]);
  const role=p.rows[0]?.target_role||"";const reqs=ROLES[role]||fallback;
  const pref=p.rows[0]?.preferences&&typeof p.rows[0].preferences==="object"?p.rows[0].preferences:{};const reported=Array.isArray(pref.skills)?pref.skills:[];
  for(const r of reqs){const existing=await db.query("select 1 from skills where lower(name)=lower($1)",[r.skill]);if(!existing.rowCount)await db.query("insert into skills(name,category) values($1,'Career requirement')",[r.skill]);const skill=await db.query("select id from skills where lower(name)=lower($1)",[r.skill]);await db.query("insert into user_skills(user_id,skill_id,readiness,verification_status,evidence) values($1,$2,$3,$4,$5::jsonb) on conflict(user_id,skill_id) do nothing",[s.userId,skill.rows[0].id,reported.some((x:string)=>x.toLowerCase()===r.skill.toLowerCase())?30:0,reported.some((x:string)=>x.toLowerCase()===r.skill.toLowerCase())?"self_reported":"unverified","[]"]);}
  const rows=await db.query("select sk.name,us.readiness,us.verification_status,us.evidence from user_skills us join skills sk on sk.id=us.skill_id where us.user_id=$1",[s.userId]);
  const by=new Map(rows.rows.map((x:any)=>[x.name.toLowerCase(),x]));
  const analysis=reqs.map(r=>{const x=by.get(r.skill.toLowerCase());const current=Number(x?.readiness||0);return {skill:r.skill,currentLevel:current,targetLevel:r.target,gap:Math.max(r.target-current,0),importance:r.importance,verified:["assessed","practical","project","work_verified"].includes(x?.verification_status),verificationStatus:x?.verification_status||"unverified",evidenceCount:Array.isArray(x?.evidence)?x.evidence.length:0};});
  const readiness=Math.round(analysis.reduce((a,x)=>a+Math.min(x.currentLevel/x.targetLevel,1)*(x.importance==="high"?1:x.importance==="medium"?.7:.4),0)/analysis.reduce((a,x)=>a+(x.importance==="high"?1:x.importance==="medium"?.7:.4),0)*100);
  return NextResponse.json({targetRole:role,analysis,readiness});
 }catch{return NextResponse.json({error:"Could not calculate skill gaps."},{status:503});}
}

export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{const b=await req.json();const skill=typeof b.skill==="string"?b.skill.trim():"";const score=Number(b.score);if(!skill||!Number.isFinite(score)||score<0||score>100)return NextResponse.json({error:"Invalid assessment."},{status:400});
 const r=await db.query("select id,evidence from user_skills us join skills sk on sk.id=us.skill_id where us.user_id=$1 and lower(sk.name)=lower($2)",[s.userId,skill]);if(!r.rowCount)return NextResponse.json({error:"Skill not found."},{status:404});
 const evidence=Array.isArray(r.rows[0].evidence)?r.rows[0].evidence:[];evidence.push({type:"assessment",score,completedAt:new Date().toISOString()});
 await db.query("update user_skills set readiness=$1,verification_status='assessed',evidence=$2::jsonb,updated_at=now() where user_id=$3 and skill_id=$4",[score,JSON.stringify(evidence),s.userId,r.rows[0].id]);
 return NextResponse.json({success:true,score});
 }catch{return NextResponse.json({error:"Could not save assessment."},{status:503});}
}