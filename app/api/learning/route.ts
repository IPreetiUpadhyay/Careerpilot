import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const CATALOG:Record<string,{title:string;provider:string;resource_type:"course"|"documentation"|"tutorial"|"practice"|"project";difficulty:"beginner"|"intermediate";url:string}[]>={
 SQL:[{title:"SQL learning path",provider:"SQLBolt",resource_type:"tutorial",difficulty:"beginner",url:"https://sqlbolt.com/"},{title:"SQL practice",provider:"HackerRank",resource_type:"practice",difficulty:"beginner",url:"https://www.hackerrank.com/domains/sql"}],
 Excel:[{title:"Excel training",provider:"Microsoft",resource_type:"documentation",difficulty:"beginner",url:"https://support.microsoft.com/en-us/excel"}],
 "Power BI":[{title:"Power BI learning path",provider:"Microsoft Learn",resource_type:"course",difficulty:"beginner",url:"https://learn.microsoft.com/training/powerplatform/power-bi/"}],
 Python:[{title:"Python fundamentals",provider:"freeCodeCamp",resource_type:"course",difficulty:"beginner",url:"https://www.freecodecamp.org/learn/scientific-computing-with-python/"},{title:"Python practice",provider:"Kaggle Learn",resource_type:"practice",difficulty:"beginner",url:"https://www.kaggle.com/learn/python"}],
 Statistics:[{title:"Statistics foundations",provider:"Khan Academy",resource_type:"course",difficulty:"beginner",url:"https://www.khanacademy.org/math/statistics-probability"}],
 "Data Visualization":[{title:"Data visualization learning",provider:"Kaggle Learn",resource_type:"course",difficulty:"beginner",url:"https://www.kaggle.com/learn/data-visualization"}]
};
const fallback=(skill:string)=>[{title:skill+" fundamentals",provider:"CareerPilot learning map",resource_type:"tutorial" as const,difficulty:"beginner" as const,url:"https://www.google.com/search?q="+encodeURIComponent(skill+" free course")}];

export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({error:"Authentication required."},{status:401});const db=getDb();if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{
  const p=await db.query("select target_role,preferences from career_profiles where user_id=$1",[s.userId]);const role=p.rows[0]?.target_role||"";const pref=p.rows[0]?.preferences||{};const reported=Array.isArray(pref.skills)?pref.skills:[];
  const skills=await db.query("select sk.name,us.readiness,us.verification_status from user_skills us join skills sk on sk.id=us.skill_id where us.user_id=$1 order by us.readiness asc",[s.userId]);
  const gaps=skills.rows.filter((x:any)=>Number(x.readiness)<70);
  const resources=[] as any[];
  for(const g of gaps){const list=CATALOG[g.name]||fallback(g.name);for(const r of list){const found=await db.query("select id,title,provider,url,resource_type,difficulty,is_free from learning_resources where lower(title)=lower($1) limit 1",[r.title]);let id:string;if(found.rowCount){id=found.rows[0].id}else{const ins=await db.query("insert into learning_resources(title,provider,url,resource_type,difficulty,skills,is_free,source_verified_at) values($1,$2,$3,$4,$5,$6::jsonb,$7,now()) returning id",[r.title,r.provider,r.url,r.resource_type,r.difficulty,JSON.stringify([g.name]),true]);id=ins.rows[0].id}resources.push({...r,id,skill:g.name,readiness:Number(g.readiness)});}}
  return NextResponse.json({targetRole:role,skills:gaps,resources});
 }catch{return NextResponse.json({error:"Could not load learning resources."},{status:503});}
}