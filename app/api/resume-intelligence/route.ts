import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

function analyzeResume(text:string, required:string[], evidence:string[], jd=""){
 const lower=text.toLowerCase(); const job=jd.toLowerCase();
 const matched=required.filter(s=>lower.includes(s.toLowerCase()));
 const jdWords=[...new Set((job.match(/[a-z][a-z0-9+#.]{2,}/g)||[]))].filter(w=>!["and","the","with","for","from","this","that","you","your","are","our","will","have","has","job","role","work"].includes(w));
 const jdMatched=jdWords.filter(w=>lower.includes(w));
 const jdCoverage=jd?Math.round(jdMatched.length/Math.max(jdWords.length,1)*100):0;
 const lower=text.toLowerCase();
 const sections=["experience","education","skills","project","summary","objective","certification"];
 const found=sections.filter(s=>lower.includes(s));
 const contact=/@|\+?\d[\d\s-]{8,}/.test(text);
 const evidenceMatched=required.filter(s=>evidence.some(e=>e.toLowerCase()===s.toLowerCase() && lower.includes(s.toLowerCase())));
 const keywordCoverage=Math.round(matched.length/Math.max(required.length,1)*100);
 const evidenceScore=Math.round(evidenceMatched.length/Math.max(required.length,1)*100);
 const structure=Math.round(found.length/sections.length*100);
 const ats=Math.min(100,Math.round(keywordCoverage*.45+evidenceScore*.25+structure*.15+(contact?10:0)+(text.length>800?5:0)));
 const gaps=required.filter(s=>!lower.includes(s.toLowerCase())).map(skill=>({skill,type:"keyword_gap"}));
 const recommendations=[
  ...gaps.slice(0,5).map(x=>"Add "+x+" only if it is genuinely supported by your experience or evidence."),
  ...(found.length<5?["Strengthen standard resume sections such as Experience, Education, Skills, Projects and Summary."]:[]),
  ...(!contact?["Add clear contact information to the resume."]:[]),
  ...(text.length<800?["Add concise impact, tools used and measurable outcomes where you have real evidence."]:[])
 ];
 const jdGaps=jd?jdWords.filter(w=>!lower.includes(w)).slice(0,20):[];
 return {atsScore:ats,roleAlignment:keywordCoverage,evidenceScore,keywordCoverage,structureScore:structure,gaps,recommendations,jdCoverage,jdMatched:jdMatched.slice(0,30),jdGaps};
}

export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{const r=await db.query("select id,name,target_role,content,version,updated_at from resumes where user_id=$1 order by updated_at desc limit 1",[s.userId]);return NextResponse.json({resume:r.rows[0]??null});}
 catch{return NextResponse.json({error:"Could not load resume."},{status:503});}
}

export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{
  const b=await req.json();const jobDescription=typeof b.jobDescription==="string"?b.jobDescription.trim():"";const content=typeof b.content==="string"?b.content.trim():"";if(!content)return NextResponse.json({error:"Resume content is required."},{status:400});
  const profile=await db.query("select target_role,preferences from career_profiles where user_id=$1",[s.userId]);
  const role=profile.rows[0]?.target_role||"";
  const pref=profile.rows[0]?.preferences||{};const reported=Array.isArray(pref.skills)?pref.skills:[];
  const skills=await db.query("select sk.name,us.evidence from user_skills us join skills sk on sk.id=us.skill_id where us.user_id=$1",[s.userId]);
  const required=[...new Set(skills.rows.map((x:any)=>x.name).concat(reported))];
  const evidence=skills.rows.flatMap((x:any)=>Array.isArray(x.evidence)?x.evidence.map((e:any)=>x.name):[x.name]);
  const analysis=analyzeResume(content,required,evidence,jobDescription);
  const existing=await db.query("select coalesce(max(version),0)+1 version from resumes where user_id=$1 and target_role=$2",[s.userId,role]);
  const resume=await db.query("insert into resumes(user_id,name,target_role,content,version,is_primary) values($1,$2,$3,$4,$5,true) returning id,name,target_role,version,updated_at",[s.userId,typeof b.name==="string"&&b.name.trim()?b.name.trim().slice(0,120):"CareerPilot Resume",role,content,existing.rows[0].version]);
  await db.query("update resumes set is_primary=false where user_id=$1 and id<>$2",[s.userId,resume.rows[0].id]);
  const saved=await db.query("insert into resume_analyses(resume_id,ats_score,role_alignment,keyword_coverage,evidence_score,gaps,recommendations) values($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) returning id,created_at",[resume.rows[0].id,analysis.atsScore,analysis.roleAlignment,analysis.keywordCoverage,analysis.evidenceScore,JSON.stringify(analysis.gaps),JSON.stringify(analysis.recommendations)]);
  return NextResponse.json({resume:resume.rows[0],analysis:{...analysis,id:saved.rows[0].id,createdAt:saved.rows[0].created_at,targetRole:role}});
 }catch{return NextResponse.json({error:"Could not analyze resume."},{status:503});}
}