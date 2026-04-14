"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Target, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Info,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Code,
  Globe,
  Award,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import React from "react";
import { fetchFromGAS, submitApplication } from "@/lib/api";
import { calculateMatch, Student, Company } from "@/lib/matching";

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
   const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedId = localStorage.getItem("spos_user_id");
    if (!savedId) {
      router.push("/auth/login");
      return;
    }

    async function loadData() {
      const studData = await fetchFromGAS('getStudents');
      const compData = await fetchFromGAS('getCompanies');
      
      const currentStudent = studData.find((s: any) => String(s.id) === savedId);
      if (currentStudent) {
        setStudent(currentStudent);
      } else {
        router.push("/auth/login");
        return;
      }
      
      setCompanies(compData);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleApply = async (company: Company) => {
    if (!student) return;
    setApplying(company.id);
    try {
      await submitApplication(student.id, student.name, company.id, company.name);
      setApplied(prev => new Set(prev).add(company.id));
    } catch (error) {
       console.error("Application failed:", error);
    } finally {
      setApplying(null);
    }
  };

  if (loading || !student) return <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">Synchronizing Intelligence...</div>;

  return (
    <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Refined Identity Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b-4 border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-6">
             <div className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest">ID: {student.id}</div>
             <div className="px-3 py-1 rounded-full bg-[#0066FF] text-white text-[8px] font-black uppercase tracking-widest">PSNA LIVE</div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
              {student.name}
            </h1>
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-xl bg-[#FF8A00] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#FF8A00]/20 flex items-center gap-2">
                <Star className="w-3 h-3 fill-current" /> SECTION D
              </div>
              <div className="text-[10px] text-black/40 font-black uppercase tracking-[0.3em] italic">BATCH OF 2026 • {student.dept}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="bg-black text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-[#0066FF]/20 blur-2xl rounded-full" />
                 <div className="relative z-10">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 block mb-1">SYSTEM STATUS</span>
                    <span className="text-sm font-black uppercase tracking-widest italic">PSNA CERTIFIED</span>
                 </div>
                 <CheckCircle2 className="w-8 h-8 text-[#FF8A00] relative z-10" />
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="AGGREGATE CGPA" value={student.cgpa.toString()} sub="ELITE PLACEMENT RANK" icon={<TrendingUp />} color="#0066FF" />
        <StatCard label="SKILL QUOTIENT" value={`${Math.min(100, student.skills.length * 15)}%`} sub="PORTFOLIO STRENGTH" icon={<Zap />} color="#FF8A00" />
        <StatCard label="ACTIVE BACKLOGS" value={student.activeBacklogs.toString()} sub="ELIGIBILITY RISK" icon={<AlertCircle />} color={student.activeBacklogs > 0 ? "#FF0000" : "#0066FF"} />
        <StatCard label="VERIFICATIONS" value={student.certifications.toString()} sub="GLOBAL BADGES" icon={<Award />} color="#9333EA" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t-4 border-black/5">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-4">
              <Code className="w-10 h-10 text-[#FF8A00]" /> RECRUITMENT <span className="text-outline border-black text-black">DRIVES</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companies.map((company, i) => {
              const match = calculateMatch(student, company);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={company.id} 
                  onClick={() => setSelectedCompany(company)}
                  className="bg-black text-white jobia-card group cursor-pointer shadow-2xl hover:shadow-[#0066FF]/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/20 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-[#FF8A00]/20 transition-all" />
                  
                  <div className="flex items-center justify-between mb-12">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center font-black text-3xl text-[#0066FF] shadow-xl group-hover:bg-[#0066FF] group-hover:text-white transition-all">
                      {company.name[0]}
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-5xl font-black leading-none mb-1",
                        match.score > 80 ? "text-[#FF8A00]" : "text-[#0066FF]"
                      )}>
                        {match.score}%
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-black">MATCH SCORE</div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 group-hover:text-[#FF8A00] transition-colors">{company.name}</h3>
                  <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-8">FULL-TIME • 2026 Batch</div>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {company.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-4 py-2 rounded-xl bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-white/10 relative z-10">
                    <div className={cn(
                      "px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest border uppercase flex items-center gap-2",
                      match.isEligible ? "bg-[#FF8A00]/20 text-[#FF8A00] border-[#FF8A00]/40" : "bg-red-500/20 text-red-500 border-red-500/40"
                    )}>
                      {match.isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                    </div>
                    <button className="text-[10px] font-black tracking-widest bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-2 group/btn uppercase hover:bg-[#FF8A00] hover:text-white transition-all">
                      ANALYZE <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl shadow-[#0066FF]/10">
            <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center justify-between">
               INSIGHTS <TrendingUp className="w-6 h-6 text-[#0066FF]" />
            </h3>
            <div className="space-y-6">
               <InsightItem title="NEXT-UP" desc="Add Docker for +18% leverage." color="#0066FF" />
               <InsightItem title="GPA BOOST" desc="Hit 8.5 for ELITE ranking." color="#FF8A00" />
               <InsightItem title="GITHUB" desc="Your 'SPOS' repo is trending." color="#9333EA" />
            </div>
          </div>

          <CodingStats studentId={student.id} />

          <div className="bg-[#f4f4f5] p-10 rounded-[3.5rem]">
             <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center justify-between">
               LINKS <Globe className="w-6 h-6 text-[#0066FF]" />
             </h3>
             <div className="space-y-4">
               <button onClick={() => window.open(student.githubLink, '_blank')} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white hover:bg-[#0066FF] hover:text-white transition-all group font-black uppercase tracking-widest text-[10px]">
                 Github
                 <ArrowUpRight className="w-4 h-4" />
               </button>
               <button onClick={() => window.open(student.resume_link, '_blank')} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white hover:bg-[#FF8A00] hover:text-white transition-all group font-black uppercase tracking-widest text-[10px]">
                 Resume
                 <ArrowUpRight className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCompany && (
          <Modal onClose={() => setSelectedCompany(null)} title={selectedCompany.name}>
            <CompanyDetailView 
              student={student} 
              company={selectedCompany} 
              isApplying={applying === selectedCompany.id}
              isApplied={applied.has(selectedCompany.id)}
              onApply={() => handleApply(selectedCompany)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: ReactNode, onClose: () => void, title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden text-black"
      >
        <div className="p-10 border-b-4 border-black/5 flex items-center justify-between">
          <h3 className="text-4xl font-black tracking-tighter uppercase italic">{title}</h3>
          <button onClick={onClose} className="w-12 h-12 hover:bg-black/5 rounded-full flex items-center justify-center transition-colors"><X className="w-8 h-8" /></button>
        </div>
        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string, value: string, sub: string, icon: ReactNode, color: string }) {
  return (
    <div className="bg-black text-white jobia-card group border-black/5 hover:bg-[#0066FF] transition-all">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group-hover:text-white/60">{label}</span>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all")} style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>
      <div className="text-6xl font-black mb-2 tracking-tighter">{value}</div>
      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white/60">{sub}</p>
    </div>
  );
}

function InsightItem({ title, desc, color }: { title: string, desc: string, color: string }) {
  return (
    <div className="group cursor-default">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
      </div>
      <p className="text-sm text-white/40 font-bold group-hover:text-white transition-colors">{desc}</p>
    </div>
  );
}

function CompanyDetailView({ student, company, isApplying, isApplied, onApply }: { student: Student, company: Company, isApplying: boolean, isApplied: boolean, onApply: () => void }) {
  const match = calculateMatch(student, company);
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-black text-white">
          <div className="text-6xl font-black text-[#0066FF] mb-2 tracking-tighter">{match.score}%</div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">ALIGNMENT SCORE</div>
        </div>
        <div className={cn(
          "p-8 rounded-[2.5rem] border-4",
          match.isEligible ? "bg-[#FF8A00]/5 border-[#FF8A00]/20 text-black" : "bg-red-500/5 border-red-500/20 text-red-600"
        )}>
          <div className="text-4xl font-black mb-2 uppercase italic tracking-tighter">{match.isEligible ? "AUTHORISED" : "DENIED"}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">SYSTEM STATUS</div>
        </div>
      </div>

      {!match.isEligible && (
        <div className="p-8 rounded-[3rem] bg-red-500/5 border-4 border-red-500/10">
          <h4 className="flex items-center gap-3 text-red-600 font-black uppercase text-xs tracking-[0.3em] mb-6">
            <AlertCircle className="w-5 h-5" /> REJECTION ANALYSIS
          </h4>
          <ul className="space-y-4">
            {match.reasons?.map((reason: string, i: number) => (
              <li key={i} className="text-sm font-bold text-red-600/80 flex items-center gap-4 uppercase italic">
                <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" /> {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6 pt-6 border-t-4 border-black/5">
        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-black/40 italic">Technical Requirements</h4>
        <div className="grid grid-cols-1 gap-4">
          {company.requiredSkills.map(skill => {
            const hasSkill = student.skills.some(s => s.toLowerCase() === skill.toLowerCase());
            return (
              <div key={skill} className="flex items-center justify-between p-6 rounded-[2rem] bg-black/5">
                <span className="text-[10px] font-black uppercase tracking-widest">{skill}</span>
                {hasSkill ? (
                  <span className="text-[8px] font-black text-[#0066FF] bg-[#0066FF]/10 px-4 py-2 rounded-full uppercase tracking-widest">VERIFIED</span>
                ) : (
                  <span className="text-[8px] font-black text-[#FF8A00] bg-[#FF8A00]/10 px-4 py-2 rounded-full uppercase tracking-widest italic">GAP DETECTED</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button 
        disabled={!match.isEligible || isApplying || isApplied}
        onClick={onApply}
        className={cn(
          "w-full py-8 rounded-[3rem] font-black text-xl uppercase tracking-[0.4em] shadow-2xl transform transition-all italic",
          isApplied 
            ? "bg-green-500 text-white cursor-default" 
            : isApplying 
              ? "bg-black/40 text-white cursor-wait animate-pulse" 
              : match.isEligible ? "bg-black text-white hover:bg-[#FF8A00]" : "bg-black/10 text-black/20 cursor-not-allowed"
        )}
      >
        {isApplied ? "APPLICATION SENT" : isApplying ? "PROCESSING..." : match.isEligible ? "INITIATE APPLICATION" : "TRACK OPPORTUNITY"}
      </button>
    </div>
  );
}

function CodingStats({ studentId }: { studentId: string }) {
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(`leetcode_${studentId}`) || "";
    return "";
  });
  const [isEditing, setIsEditing] = useState(!username);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (username && !isEditing) {
      setLoading(true);
      fetch(`https://leetcode-stats-api.herokuapp.com/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") setStats(data);
          else setStats(null);
        })
        .catch(() => setStats(null))
        .finally(() => setLoading(false));
    }
  }, [username, isEditing]);

  const saveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("username") as HTMLInputElement;
    const val = input.value.trim();
    if (val) {
      localStorage.setItem(`leetcode_${studentId}`, val);
      setUsername(val);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-zinc-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-zinc-900/10">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
           <Code className="w-6 h-6 text-[#FF8A00]" /> LOGIC
        </h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase tracking-widest text-[#FF8A00] hover:text-white transition-colors">
            EDIT
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveUsername} className="flex flex-col gap-4">
          <p className="text-[10px] font-black tracking-widest uppercase text-white/40">Connect LeetCode Profile</p>
          <input 
            name="username" 
            defaultValue={username} 
            placeholder="LeetCode Username"
            className="w-full px-5 py-4 rounded-2xl bg-white/5 text-sm font-black outline-none focus:ring-2 focus:ring-[#FF8A00] border border-white/10"
          />
          <button type="submit" className="px-5 py-4 rounded-2xl bg-[#FF8A00] text-black text-[10px] font-black uppercase tracking-widest w-full hover:bg-white transition-colors">
            SYNC CODING STATS
          </button>
        </form>
      ) : loading ? (
        <div className="h-32 flex items-center justify-center animate-pulse text-[#FF8A00] text-xs font-black uppercase tracking-[0.3em]">
          INTEGRATING...
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#00ADD8] mb-1">EASY</div>
              <div className="text-3xl font-black tracking-tighter shrink-0">{stats.easySolved}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#FF8A00] mb-1">MEDIUM</div>
              <div className="text-3xl font-black tracking-tighter shrink-0">{stats.mediumSolved}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#ef4444] mb-1">HARD</div>
              <div className="text-3xl font-black tracking-tighter shrink-0">{stats.hardSolved}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">RANK</div>
              <div className="text-xl truncate font-black tracking-tighter shrink-0">#{stats.ranking}</div>
            </div>
          </div>
          <a href={`https://leetcode.com/${username}`} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full py-5 px-6 bg-[#FF8A00]/10 text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all group">
            LEETCODE PROFILE
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      ) : (
        <div className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 p-5 rounded-2xl">API Error / User Not Found</div>
      )}

      {/* HackerRank Quick Link placeholder */}
      <a href="https://hackerrank.com" target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between p-5 rounded-2xl bg-[#00ea64]/10 hover:bg-[#00ea64] text-[#00ea64] hover:text-black transition-all group">
         <span className="text-[10px] font-black uppercase tracking-widest">HACKERRANK</span>
         <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </a>
    </div>
  );
}
