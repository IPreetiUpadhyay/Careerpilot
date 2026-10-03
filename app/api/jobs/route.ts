import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const catalog=["SQL","Excel","Power BI","Python","Statistics","Data Visualization","Business Analysis","Communication","Product Analytics","Machine Learning","Problem Solving","Domain Knowledge","Tableau","R","Java","JavaScript","React","AWS","Azure","Git","Figma","Project Management"];
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9+#.]/g," ").replace(/\s+/g," ").trim();
const has=(t:string,p:string)=>norm(t).includes(norm(p));
function line(t:string,labels:string[]){return t.split(/\n+/).map(x=>x.trim()).find(x=>labels.some(l=>norm(x).startsWith(norm(l))))?.replace(/^[^:]+:\s*/,"")||""}
function parse(raw:string){
 const required=catalog.filter(s=>has(raw,s));
 const preferred=raw.match(/(?:preferred|nice to have|good to have|bonus)[\s\S]{0,900}/i)?.[0]||"";
 return {title:line(raw,["job title","position","role"])||"Untitled opportunity",company:line(raw,["company","organization","employer"])||"Company not specified",location:line(raw,["location","work location"])||"Location not specified",work_mode:has(raw,"remote")?"remote":has(raw,"hybrid")?"hybrid":"onsite",employment_type:has(raw,"internship")?"internship":has(raw,"part-time")?"part-time":has(raw,"contract")?"contract":"full-time",skills:required,requirements:required,preferredSkills:catalog.filter(s=>has(preferred,s)),description:raw};
}
export async function GET(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 const {searchParams}=new URL(req.url);const q=searchParams.get("q")||"";
 try{const r=await db.query(`select j.id,j.company,j.title,j.location,j.work_mode,j.employment_type,j.seniority,j.experience_requirement,j.salary_min,j.salary_max,j.salary_currency,j.visa_sponsorship,j.skills,j.requirements,j.url,j.source,exists(select 1 from saved_jobs s where s.job_id=j.id and s.user_id=$1) saved from jobs j where ($2='' or lower(j.title||'') like lower($2) or lower(j.company||'') like lower($2) or lower(j.location||'') like lower($2)) order by j.updated_at desc limit 100`,[s.userId,"%"+q+"%"]);return NextResponse.json({jobs:r.rows})}catch{return NextResponse.json({error:"Could not load opportunities."},{status:503})}
}
export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{const b=await req.json();const raw=typeof b.description==="string"?b.description.trim():"";if(!raw)return NextResponse.json({error:"Job description is required."},{status:400});const p=parse(raw);
 const r=await db.query(`insert into jobs(source,company,title,description,location,work_mode,employment_type,skills,requirements,raw_data) values('user-provided', $1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb) returning id,company,title,location,work_mode,employment_type,skills,requirements`,[p.company,p.title,raw,p.location,p.work_mode,p.employment_type,JSON.stringify(p.skills),JSON.stringify(p.requirements),JSON.stringify({preferredSkills:p.preferredSkills})]);
 return NextResponse.json({job:r.rows[0]}, {status:201})}catch{return NextResponse.json({error:"Could not save opportunity."},{status:503})}
}