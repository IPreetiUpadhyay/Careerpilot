"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, BriefcaseBusiness, CheckCircle2, FileCheck2, FolderKanban, Globe2, Sparkles, Target, Wrench } from "lucide-react";
import { loadCareerState, CareerState } from "../lib/career-state";
import { buildCareerGraph, CareerGraphNode } from "../lib/career-graph";

const icons = { role: Target, skill: Wrench, project: FolderKanban, evidence: FileCheck2, opportunity: Globe2, application: BriefcaseBusiness, goal: Target };

export default function KnowledgeGraphPage() {
  const [state, setState] = useState<CareerState | null>(null);
  useEffect(() => {
    const refresh = () => setState(loadCareerState());
    refresh();
    window.addEventListener("careerpilot-state-updated", refresh);
    return () => window.removeEventListener("careerpilot-state-updated", refresh);
  }, []);

  const graph = useMemo(() => state ? buildCareerGraph(state) : null, [state]);
  if (!state || !graph) return <main className="min-h-screen grid place-items-center bg-[#08090d] text-sm text-zinc-500">Loading Career Graph...</main>;

  const groups = Object.entries(graph.nodes.reduce<Record<string, CareerGraphNode[]>>((acc, node) => {
    (acc[node.type] ??= []).push(node);
    return acc;
  }, {}));

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Command Center</a>
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles size={15}/></span>CareerPilot</div>
          <span className="text-xs text-zinc-600">Career Graph</span>
        </header>

        <section className="py-9">
          <div className="flex items-center gap-2 text-xs text-violet-300"><BrainCircuit size={15}/> Connected career intelligence</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">See how your career data connects.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">CareerPilot connects roles, skills, projects, evidence, opportunities and applications so one update can inform the rest of your career system.</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Nodes" value={String(graph.nodes.length)} />
          <Metric label="Connections" value={String(graph.edges.length)} />
          <Metric label="Skills mapped" value={String(graph.nodes.filter(n => n.type === "skill").length)} />
        </div>

        <section className="mt-5 rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs text-zinc-600">CAREER KNOWLEDGE GRAPH</p><h2 className="mt-1 text-xl font-semibold">{state.targetRole || "Career direction"} ecosystem</h2></div><span className="text-xs text-zinc-600">{graph.edges.length} relationships</span></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groups.map(([type, nodes]) => {
              const Icon = icons[type as keyof typeof icons] ?? Target;
              return <div key={type} className="rounded-2xl border border-white/[.06] bg-black/10 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-600"><Icon size={14}/>{type}</div>
                <div className="mt-3 space-y-2">{nodes.slice(0, 8).map(node => <div key={node.id} className="flex items-center justify-between rounded-xl border border-white/[.05] px-3 py-2"><span className="truncate text-xs text-zinc-400">{node.label}</span><span className="text-[10px] text-violet-300">{node.strength}</span></div>)}</div>
              </div>;
            })}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-xs text-zinc-600">RELATIONSHIPS</p>
            <div className="mt-4 space-y-2">
              {graph.edges.slice(0, 12).map((edge, i) => {
                const from = graph.nodes.find(n => n.id === edge.from)?.label ?? edge.from;
                const to = graph.nodes.find(n => n.id === edge.to)?.label ?? edge.to;
                return <div key={i} className="flex items-center gap-2 rounded-xl border border-white/[.05] p-3 text-xs"><span className="truncate text-zinc-300">{from}</span><span className="shrink-0 text-violet-300">→ {edge.relation} →</span><span className="truncate text-zinc-500">{to}</span></div>;
              })}
              {!graph.edges.length && <p className="py-6 text-center text-xs text-zinc-700">Connections will appear as you build your Career DNA.</p>}
            </div>
          </div>
          <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-6">
            <p className="text-xs text-zinc-600">WHY THIS MATTERS</p>
            <div className="mt-5 space-y-4">
              <Point title="Skills become evidence" text="Projects and assessments can strengthen the skills they demonstrate." />
              <Point title="Jobs become context" text="Saved opportunities can connect required skills back to your target role." />
              <Point title="Applications become outcomes" text="Application activity can feed your career analytics without inventing results." />
              <Point title="One source of truth" text="CareerPilot can use these relationships for future recommendations and personalization." />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">{label}</p></div>; }
function Point({ title, text }: { title: string; text: string }) { return <div className="flex gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet-300"/><div><p className="text-xs font-medium text-zinc-300">{title}</p><p className="mt-1 text-xs leading-5 text-zinc-600">{text}</p></div></div>; }
