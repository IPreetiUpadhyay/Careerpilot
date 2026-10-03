import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

const REQUIREMENTS: Record<string, {skill:string; target:number; importance:"high"|"medium"}[]> = {
  "Data Analyst":[{skill:"SQL",target:80,importance:"high"},{skill:"Excel",target:75,importance:"high"},{skill:"Power BI",target:75,importance:"high"},{skill:"Python",target:60,importance:"medium"},{skill:"Statistics",target:65,importance:"medium"},{skill:"Data Visualization",target:75,importance:"high"}],
  "Business Analyst":[{skill:"Excel",target:80,importance:"high"},{skill:"SQL",target:70,importance:"high"},{skill:"Business Analysis",target:80,importance:"high"},{skill:"Power BI",target:65,importance:"medium"},{skill:"Communication",target:80,importance:"high"}],
  "Product Analyst":[{skill:"SQL",target:80,importance:"high"},{skill:"Excel",target:70,importance:"medium"},{skill:"Product Analytics",target:80,importance:"high"},{skill:"Data Visualization",target:75,importance:"high"},{skill:"Statistics",target:65,importance:"medium"}],
  "Data Scientist":[{skill:"Python",target:85,importance:"high"},{skill:"SQL",target:75,importance:"high"},{skill:"Statistics",target:85,importance:"high"},{skill:"Machine Learning",target:80,importance:"high"},{skill:"Data Visualization",target:70,importance:"medium"}]
};

export async function GET(){
  const session=await getSession(); if(!session) return NextResponse.json({error:"Authentication required."},{status:401});
  const db=getDb(); if(!db) return NextResponse.json({error:"Database unavailable."},{status:503});
  try{
    const goal=await db.query("select id,title,target_role,target_location,work_mode,status from career_goals where user_id=$1 and status='active' order by created_at desc limit 1",[session.userId]);
    if(!goal.rowCount) return NextResponse.json({goal:null,roadmap:null});
    const g=goal.rows[0];
    const profile=await db.query("select preferences from career_profiles where user_id=$1",[session.userId]);
    const skills=Array.isArray(profile.rows[0]?.preferences?.skills)?profile.rows[0].preferences.skills:[];
    const reqs=REQUIREMENTS[g.target_role] ?? [{skill:"Communication",target:75,importance:"high"},{skill:"Problem Solving",target:75,importance:"high"},{skill:"Domain Knowledge",target:65,importance:"medium"}];

    let roadmap=await db.query("select id,title,status from career_roadmaps where user_id=$1 and goal_id=$2 and status='active' order by created_at desc limit 1",[session.userId,g.id]);
    if(!roadmap.rowCount){
      const created=await db.query("insert into career_roadmaps(user_id,goal_id,title,status) values($1,$2,$3,'active') returning id,title,status",[session.userId,g.id,g.target_role+" Career Roadmap"]);
      roadmap=created;
      const items=[
        {title:"Career direction confirmed",description:"Your target role, geography and work mode are set.",stage:"Direction",type:"learning",skills:[],status:"completed"},
        ...reqs.map(r=>({title:"Build "+r.skill,description:"Develop "+r.skill+" toward a "+r.target+"% role-ready level.",stage:"Skills",type:"skill",skills:[r.skill],status:skills.some((s:string)=>s.toLowerCase()===r.skill.toLowerCase())?"in_progress":"available"})),
        {title:"Build portfolio evidence",description:"Create practical projects proving your "+g.target_role+" skills.",stage:"Proof",type:"portfolio",skills:reqs.filter(r=>r.target>=75).map(r=>r.skill),status:"available"},
        {title:"Prepare your resume",description:"Create a role-aligned resume using your real evidence.",stage:"Job Ready",type:"resume",skills:[],status:"available"},
        {title:"Target relevant opportunities",description:"Review and save jobs that match your profile and preferences.",stage:"Applications",type:"application",skills:[],status:"available"},
        {title:"Prepare for interviews",description:"Practice role-specific technical, behavioral and HR interviews.",stage:"Interview",type:"interview",skills:[],status:"available"}
      ];
      for(let i=0;i<items.length;i++){const it=items[i]; await db.query("insert into roadmap_items(roadmap_id,title,description,stage,item_type,skill_ids,position,status) values($1,$2,$3,$4,$5,$6::jsonb,$7,$8)",[roadmap.rows[0].id,it.title,it.description,it.stage,it.type,JSON.stringify(it.skills),i,it.status]);}
    }
    const items=await db.query("select id,title,description,stage,item_type,skill_ids,position,status,completed_at from roadmap_items where roadmap_id=$1 order by position",[roadmap.rows[0].id]);
    return NextResponse.json({goal:{id:g.id,title:g.title,targetRole:g.target_role,targetLocation:g.target_location,workMode:g.work_mode},roadmap:roadmap.rows[0],items:items.rows});
  }catch{return NextResponse.json({error:"Could not load career roadmap."},{status:503});}
}

export async function PATCH(request:Request){
  const session=await getSession(); if(!session) return NextResponse.json({error:"Authentication required."},{status:401});
  const db=getDb(); if(!db) return NextResponse.json({error:"Database unavailable."},{status:503});
  try{
    const body=await request.json(); const id=typeof body?.id==="string"?body.id:""; const status=typeof body?.status==="string"?body.status:"";
    if(!id||!["available","in_progress","completed"].includes(status)) return NextResponse.json({error:"Invalid roadmap item."},{status:400});
    const result=await db.query("update roadmap_items ri set status=$1, completed_at=case when $1='completed' then now() else null end from career_roadmaps r where ri.id=$2 and ri.roadmap_id=r.id and r.user_id=$3 returning ri.id,ri.status,ri.completed_at",[status,id,session.userId]);
    if(!result.rowCount) return NextResponse.json({error:"Roadmap item not found."},{status:404});
    return NextResponse.json({item:result.rows[0]});
  }catch{return NextResponse.json({error:"Could not update roadmap item."},{status:503});}
}