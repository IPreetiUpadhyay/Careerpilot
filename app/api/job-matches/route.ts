import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";
const n=(s:string)=>s.toLowerCase().replace(/[^a-z0-9+#.]/g," ").replace(/\s+/g," ").trim();
const overlap=(a:string[],b:string[])=>a.filter(x=>b.some(y=>n(x)===n(y))).length;
export async function GET(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 const q=new URL(req.url).searchParams.get("q")||"";
 try{
  const p=await db.query("select target_role,work_mode,geography,preferences from career_profiles where user_id=$1",[s.userId]);
  const skills=await db.query("select sk.name,us.readiness from user_skills us join skills sk on sk.id=us.skill_id where us.user_id=$1",[s.userId]);
  const rows=await db.query("select id,company,title,location,work_mode,employment_type,seniority,experience_requirement,education_requirement,visa_sponsorship,work_authorization,timezone_requirement,skills,requirements,url,source from jobs where ($2='' or lower(title||'') like lower($2) or lower(company||'') like lower($2) or lower(location||'') like lower($2)) order by updated_at desc limit 100",[s.userId,"%"+q+"%"]);
  const prof=p.rows[0]||{},owned=skills.rows.map((x:any)=>x.name),verified=skills.rows.filter((x:any)=>Number(x.readiness)>=70).map((x:any)=>x.name);
  const matches=rows.rows.map((j:any)=>{const req=Array.isArray(j.skills)?j.skills:[],m=overlap(owned,req),v=overlap(verified,req),skill=req.length?Math.round(m/req.length*70+v/req.length*30):0,location=!j.location||!prof.geography?50:n(j.location).includes(n(prof.geography))?100:50,work=!prof.work_mode||prof.work_mode==="flexible"||!j.work_mode?50:n(j.work_mode)===n(prof.work_mode)?100:0,auth=j.work_authorization||j.visa_sponsorship==null?50:(j.visa_sponsorship?75:25),total=Math.round(skill*.5+location*.15+work*.15+auth*.2),missing=req.filter((x:string)=>!owned.some(y=>n(x)===n(y)));return {...j,match_score:total,breakdown:{skills:skill,experience:50,education:50,location,work_mode:work,authorization:auth,seniority:50},missing_evidence:missing};}).sort((a:any,b:any)=>b.match_score-a.match_score);
  for(const j of matches.slice(0,50)) await db.query("insert into job_matches(user_id,job_id,skills_score,experience_score,education_score,location_score,work_mode_score,authorization_score,seniority_score,missing_evidence,explanation) values($1,$2,$3,50,50,$4,$5,$6,50,$7::jsonb,$8::jsonb) on conflict(user_id,job_id) do update set skills_score=excluded.skills_score,location_score=excluded.location_score,work_mode_score=excluded.work_mode_score,authorization_score=excluded.authorization_score,missing_evidence=excluded.missing_evidence,explanation=excluded.explanation,computed_at=now()",[s.userId,j.id,j.breakdown.skills,j.breakdown.location,j.breakdown.work_mode,j.breakdown.authorization,JSON.stringify(j.missing_evidence),JSON.stringify(j.breakdown)]);
  return NextResponse.json({matches});
 }catch{return NextResponse.json({error:"Could not calculate job matches."},{status:503})}
}