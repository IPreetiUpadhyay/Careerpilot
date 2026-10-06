import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { getSession } from "../../lib/auth";

export async function GET(){
 const s=await getSession(); if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb(); if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{
  const [a,o,i,p,h]=await Promise.all([
   db.query("select status,count(*)::int count from applications where user_id=$1 group by status",[s.userId]),
   db.query("select outcome_type,result,count(*)::int count from outcomes where user_id=$1 group by outcome_type,result order by count desc",[s.userId]),
   db.query("select count(*)::int total,coalesce(round(avg(score),1),0) avg_score from interview_sessions where user_id=$1 and status='completed'",[s.userId]),
   db.query("select count(*)::int total,coalesce(count(*) filter(where readiness>=70),0)::int verified from user_skills where user_id=$1",[s.userId]),
   db.query("select o.id,o.outcome_type,o.result,o.feedback,o.recorded_at,j.company,j.title,j.location from outcomes o left join applications ap on ap.id=o.application_id left join jobs j on j.id=ap.job_id where o.user_id=$1 order by o.recorded_at desc limit 25",[s.userId])
  ]);
  const stages: Record<string, number> = Object.fromEntries(a.rows.map((x:any)=>[String(x.status), Number(x.count)]));
  const total: number = Object.values(stages).reduce((n: number, v: number) => n + v, 0);
  const interviews: number = Number(i.rows[0]?.total || 0); const offers: number = Number(stages["offer"] || 0); const offerRate: number = total > 0 ? Math.round((offers / total) * 100) : 0;
  return NextResponse.json({stages,total,interviews,offers,offerRate,interviewScore:Number(i.rows[0]?.avg_score||0),outcomes:o.rows,history:h.rows,skills:{total:Number(p.rows[0]?.total||0),verified:Number(p.rows[0]?.verified||0)}});
 }catch{return NextResponse.json({error:"Could not load outcome analytics."},{status:503})}
}

export async function POST(req:Request){
 const s=await getSession(); if(!s)return NextResponse.json({error:"Authentication required."},{status:401});
 const db=getDb(); if(!db)return NextResponse.json({error:"Database unavailable."},{status:503});
 try{
  const b=await req.json();
  const r=await db.query("insert into outcomes(user_id,application_id,outcome_type,result,feedback,metadata) values($1,$2,$3,$4,$5,$6::jsonb) returning id",[s.userId,b.applicationId||null,b.outcomeType||"other",b.result||null,b.feedback||"",JSON.stringify(b.metadata||{})]);
  if(b.applicationId&&b.applicationStatus) await db.query("update applications set status=$3,updated_at=now() where id=$1 and user_id=$2",[b.applicationId,s.userId,b.applicationStatus]);
  return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Could not record outcome."},{status:503})}
}