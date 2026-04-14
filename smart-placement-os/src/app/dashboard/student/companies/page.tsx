"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  Info,
  X,
  Target,
  Trophy,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchFromGAS } from "@/lib/api";
import { calculateMatch, Student, Company } from "@/lib/matching";

export default function CompaniesPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !student) return <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">Scanning Recruitment Matrix...</div>;

  return (
    <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b-4 border-black/5">
        <div className="flex flex-col gap-6">
          <button 
                onClick={() => router.push("/dashboard/student")}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#0066FF] hover:gap-5 transition-all w-fit group"
          >
              <ArrowRight className="w-4 h-4 rotate-180" />
              BACK TO COMMAND CENTER
          </button>
          <div>
            <h1 className="text-6xl font-black tracking-tighter leading-none mb-4 uppercase">OFFICIAL<br /><span className="text-[#FF8A00]">RECRUITERS</span></h1>
            <p className="text-xl text-black/40 font-bold uppercase tracking-widest">Active Drive Database • 2026 Batch</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-[#0066FF] transition-colors" />
            <input 
              type="text" 
              placeholder="Filter names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/5 border-2 border-black/5 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#0066FF] focus:ring-8 focus:ring-[#0066FF]/5 w-full transition-all"
            />
          </div>
          <button className="p-5 rounded-[1.5rem] bg-black text-white hover:bg-[#FF8A00] transition-all shadow-xl">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredCompanies.map((company, i) => {
          const match = calculateMatch(student, company);
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="bg-black text-white jobia-card group cursor-pointer shadow-2xl hover:shadow-[#0066FF]/20 relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF8A00]/10 blur-[60px] rounded-full -ml-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-3xl text-[#0066FF] shadow-lg group-hover:bg-[#0066FF] group-hover:text-white transition-all">
                  {company.name[0]}
                </div>
                <div className="text-right">
                   <div className={cn(
                     "text-4xl font-black leading-none",
                     match.score > 80 ? "text-[#FF8A00]" : "text-[#0066FF]"
                   )}>{match.score}%</div>
                   <div className="text-[8px] font-black uppercase tracking-widest text-white/40">MATCH LEVEL</div>
                </div>
              </div>

              <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 group-hover:text-[#FF8A00] transition-colors relative z-10">{company.name}</h3>
              
              <div className="space-y-6 flex-1 relative z-10">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 rounded-xl bg-white/5 text-[8px] font-black uppercase tracking-widest text-[#0066FF] border border-white/5 flex items-center gap-2">
                      <Target className="w-3 h-3" /> {company.minCgpa} CGPA
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 text-[8px] font-black uppercase tracking-widest text-[#FF8A00] border border-white/5 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> {company.allowedBacklogs} ARREARS MAX
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex flex-wrap gap-2">
                     {company.requiredSkills.slice(0, 3).map(skill => (
                       <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/40 border border-white/5">
                         {skill}
                       </span>
                     ))}
                     {company.requiredSkills.length > 3 && <span className="text-[8px] font-black p-1 text-white/20">+{company.requiredSkills.length - 3} MORE</span>}
                   </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                <div className={cn(
                  "px-4 py-2 rounded-xl text-[8px] font-black tracking-widest border flex items-center gap-2 uppercase italic",
                  match.isEligible ? "bg-[#FF8A00]/20 text-[#FF8A00] border-[#FF8A00]/40" : "bg-red-500/20 text-red-500 border-red-500/40"
                )}>
                  {match.isEligible ? "Qualified" : "Blocked"}
                </div>
                <button className="text-[10px] font-black tracking-widest text-[#0066FF] flex items-center gap-2 group/btn uppercase italic hover:text-white transition-colors">
                  VIEW FULL SPECS <ArrowUpRight className="w-5 h-5 group-hover/btn:rotate-45 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCompany && (
          <Modal onClose={() => setSelectedCompany(null)} title={selectedCompany.name}>
            <CompanyDetailView student={student} company={selectedCompany} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden text-black"
      >
        <div className="p-10 border-b-4 border-black/5 flex items-center justify-between bg-black/5">
          <h3 className="text-4xl font-black italic tracking-tighter uppercase">{title}</h3>
          <button onClick={onClose} className="w-14 h-14 hover:bg-black/5 rounded-full flex items-center justify-center transition-all group">
            <X className="w-8 h-8 text-black/40 group-hover:text-black" />
          </button>
        </div>
        <div className="p-12 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CompanyDetailView({ student, company }: { student: Student, company: Company }) {
  const match = calculateMatch(student, company);
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-10 rounded-[3rem] bg-black text-white shadow-2xl">
          <div className="text-6xl font-black text-[#0066FF] mb-2 italic tracking-tighter">{match.score}%</div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">ALIGNMENT SCORE</div>
        </div>
        <div className={cn(
          "p-10 rounded-[3rem] border-4 transition-all flex flex-col justify-center",
          match.isEligible ? "bg-[#FF8A00]/5 border-[#FF8A00]/20 text-black" : "bg-red-500/5 border-red-500/20 text-red-600"
        )}>
          <div className="text-4xl font-black mb-2 italic tracking-tighter uppercase">{match.isEligible ? "APPROVED" : "REJECTED"}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">SYSTEM VERDICT</div>
        </div>
      </div>

      <div className="space-y-8">
        <h4 className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-black/40 italic">
          <Zap className="w-6 h-6 text-[#0066FF]" /> THRESHOLD ANALYSIS
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <RequirementBox icon={<Target className="text-[#0066FF]" />} label="MIN CGPA" value={company.minCgpa} current={student.cgpa} pass={student.cgpa >= company.minCgpa} />
          <RequirementBox icon={<Lock className="text-[#FF8A00]" />} label="BACKLOGS" value={`${company.allowedBacklogs} MAX`} current={student.activeBacklogs} pass={student.activeBacklogs <= company.allowedBacklogs} />
        </div>
      </div>

      {!match.isEligible && (
        <div className="p-10 rounded-[3rem] bg-red-600 text-white shadow-2xl shadow-red-600/20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-white" /> ELIGIBILITY GAP
          </h4>
          <ul className="space-y-6">
            {match.reasons?.map((reason: string, i: number) => (
              <li key={i} className="text-lg font-black flex items-start gap-4 uppercase tracking-tighter italic">
                <div className="w-4 h-4 rounded-full bg-white mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-8">
        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-black/40 italic">ENGINEERING STACK SYNC</h4>
        <div className="grid grid-cols-1 gap-4">
          {company.requiredSkills.map(skill => {
            const hasSkill = student.skills.some(s => s.toLowerCase() === skill.toLowerCase());
            return (
              <div key={skill} className="flex items-center justify-between p-6 rounded-[2rem] bg-black/5 hover:bg-black/10 transition-all group">
                <span className="font-black tracking-widest uppercase text-xs">{skill}</span>
                {hasSkill ? (
                  <div className="px-5 py-2.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-[8px] font-black flex items-center gap-2 border border-[#0066FF]/20 uppercase tracking-[0.2em]">
                    <CheckCircle2 className="w-4 h-4" /> VERIFIED
                  </div>
                ) : (
                  <div className="px-5 py-2.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] text-[8px] font-black flex items-center gap-2 border border-[#FF8A00]/20 uppercase tracking-[0.2em] italic">
                    <Info className="w-4 h-4" /> GAP DETECTED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-8 flex flex-col gap-4">
        {company.name.toLowerCase().includes("zoho") && (
          <button 
            onClick={() => router.push(`/dashboard/student/interview?difficulty=Hard&company=Zoho`)}
            className="w-full py-8 rounded-[3.5rem] font-black text-xl tracking-[0.4em] uppercase italic transition-all shadow-2xl bg-[#00FF85] text-black hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
          >
            <Zap className="w-6 h-6 fill-current" />
            TAKE ZOHO LEVEL MOCK
          </button>
        )}
        <button className={cn(
          "w-full py-8 rounded-[3.5rem] font-black text-xl tracking-[0.4em] uppercase italic transition-all shadow-2xl",
          match.isEligible 
            ? "bg-black text-white hover:bg-[#FF8A00] shadow-[#FF8A00]/20 hover:-translate-y-2" 
            : "bg-black/10 text-black/20 cursor-not-allowed"
        )}>
          {match.isEligible ? "INITIATE APPLICATION FLOW" : "INSUFFICIENT CREDENTIALS"}
        </button>
      </div>
    </div>
  );
}

function RequirementBox({ icon, label, value, current, pass } : { icon: any, label: string, value: any, current: any, pass: boolean }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-black/5 border-2 border-black/5 flex flex-col gap-6 group hover:bg-white hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all">{icon}</div>
        <div className={cn("text-[8px] font-black uppercase px-4 py-1.5 rounded-full", pass ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
          {pass ? "SYNCED" : "UNSYNCED"}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">{label}</div>
        <div className="text-3xl font-black italic tracking-tighter">{value}</div>
        <div className="text-[9px] font-bold text-black/20 mt-2 uppercase tracking-widest">Candidate Value: <span className="text-black">{current}</span></div>
      </div>
    </div>
  );
}
