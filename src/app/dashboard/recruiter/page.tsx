"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Sparkles,
  ChevronRight,
  BrainCircuit,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchFromGAS } from "@/lib/api";
import { calculateMatch, Student, Company } from "@/lib/matching";

export default function RecruiterDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<Company>({
    id: "REQ-001",
    name: "Google India",
    requiredSkills: ["Python", "Java", "DSA", "System Design"],
    prioritySkills: ["DSA", "System Design"],
    minCgpa: 8.0,
    allowedBacklogs: 0
  });

  useEffect(() => {
    async function loadData() {
      const data = await fetchFromGAS('getStudents');
      setStudents(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const results = students.map(s => ({
    student: s,
    match: calculateMatch(s, requirements)
  })).sort((a, b) => b.match.score - a.match.score);

  const eligibleCount = results.filter(r => r.match.isEligible).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">PSNA Placement Cell</h1>
          <p className="text-muted-foreground">Official recruitment gateway for PSNA College.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Create New Requirement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requirement Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border-white/5 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Define Requirements</h2>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Role Name</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                  value="Software Engineer L3"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Min CGPA</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                    value={requirements.minCgpa}
                    onChange={(e) => setRequirements({...requirements, minCgpa: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Max Backlogs</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                    value={requirements.allowedBacklogs}
                    onChange={(e) => setRequirements({...requirements, allowedBacklogs: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Required Skills</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {requirements.requiredSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-1 border border-primary/20">
                      {skill} <Plus className="w-2 h-2 rotate-45" />
                    </span>
                  ))}
                  <button className="px-3 py-1 bg-white/5 border border-white/10 text-muted-foreground rounded-full text-[10px] font-bold hover:bg-white/10 transition-all">
                    + Add Skill
                  </button>
                </div>
              </div>

              <button className="w-full py-4 mt-4 rounded-2xl bg-white text-background font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Refresh Shortlist
              </button>
            </div>
          </div>

          {/* Smart Relaxation Engine */}
          <div className="glass-card p-6 rounded-3xl bg-blue-500/5 border-blue-500/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-bold text-sm">PSNA Talent Engine</h3>
             </div>
             
             {eligibleCount < 5 ? (
               <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Only <span className="text-white font-bold">{eligibleCount}</span> candidates meet all strict criteria. 
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setRequirements({...requirements, minCgpa: 1})} // Just for visual demo
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Lower CGPA to 7.5 (+12 candidates)
                    </button>
                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Allow 1 active backlog (+6 high-skill)
                    </button>
                  </div>
               </div>
             ) : (
               <p className="text-xs text-muted-foreground">Shortlist is healthy with {eligibleCount} candidates.</p>
             )}
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Smart Shortlist <span className="text-sm font-medium text-muted-foreground ml-2">{eligibleCount} Eligible</span></h2>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((r, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={r.student.id} 
                className={cn(
                  "glass-card p-6 rounded-2xl transition-all border-l-4",
                  r.match.isEligible ? "border-l-primary" : "border-l-red-500/50 opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">
                      {r.student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{r.student.name}</h3>
                        <span className="text-[10px] text-muted-foreground">ID: {r.student.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.student.dept} • CGPA {r.student.cgpa} • {r.student.activeBacklogs} Backlogs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-xl font-black",
                      r.match.score > 80 ? "text-green-500" : r.match.score > 60 ? "text-primary" : "text-amber-400"
                    )}>
                      {r.match.score}%
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Match</div>
                  </div>
                </div>

                {r.match.isEligible ? (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.match.explanations?.slice(0, 2).map(e => (
                        <div key={e} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <AlertCircle className="w-3 h-3 text-primary" /> {e}
                        </div>
                      ))}
                    </div>
                    <button className="text-[10px] font-black text-primary hover:translate-x-1 transition-transform flex items-center gap-1">
                      VIEW PROFILE <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-red-400 font-medium">
                    Reasons: {r.match.reasons?.join(', ')}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
