"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  CheckCircle2, 
  Building2, 
  BarChart4, 
  Upload,
  Globe,
  MoreVertical,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, ReactNode } from "react";
import React from "react";
import { fetchFromGAS } from "@/lib/api";
import { Student } from "@/lib/matching";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchFromGAS('getStudents');
      setStudents(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalStudents = 1247; // Scale demo
  const eligibleCount = students.filter(s => s.activeBacklogs === 0 && s.cgpa >= 7.5).length + 800;
  const placedCount = 341;

  if (loading) return <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">Initializing Command Core...</div>;

  return (
    <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b-4 border-black/5">
        <div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-4 uppercase">ADMIN<br /><span className="text-[#0066FF]">PANEL</span></h1>
          <p className="text-xl text-black/40 font-bold uppercase tracking-widest">Campus Placement Management • Version 2.5</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-4 rounded-[1.5rem] bg-black text-white hover:bg-[#FF8A00] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3">
            <Globe className="w-5 h-5" /> SYSTEM CONFIG
          </button>
        </div>
      </div>

      {/* Analytics Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="TOTAL CANDIDATES" value={totalStudents.toLocaleString()} sub="+128 THIS BATCH" icon={<Users />} color="#0066FF" />
        <StatCard label="QUALIFIED POOL" value={eligibleCount.toLocaleString()} sub="71% OF TOTAL" icon={<CheckCircle2 />} color="#FF8A00" />
        <StatCard label="SUCCESSFUL HIRES" value={placedCount.toString()} sub="27.3% RATE" icon={<Building2 />} color="#9333EA" />
        <StatCard label="ACTIVE DRIVES" value="18" sub="3 CURRENTLY LIVE" icon={<BarChart4 />} color="#0066FF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t-4 border-black/5">
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white border-4 border-black rounded-[4rem] overflow-hidden shadow-2xl">
              <div className="p-10 border-b-4 border-black/5 flex items-center justify-between bg-black/5">
                 <h2 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                   <Users className="w-8 h-8 text-[#0066FF]" /> STUDENT <span className="text-outline border-black text-black">REGISTRY</span>
                 </h2>
                 <button className="text-[10px] font-black uppercase tracking-widest text-[#0066FF] hover:underline transition-all">Download CSV Report</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/5 text-[10px] uppercase tracking-[0.3em] font-black text-black/40">
                     <tr>
                       <th className="px-10 py-6">IDENTITIY</th>
                       <th className="px-10 py-6">CORE DEPT</th>
                       <th className="px-10 py-6">GPA</th>
                       <th className="px-10 py-6">RISKS</th>
                       <th className="px-10 py-6">LOGS</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/5">
                     {students.map((student, i) => (
                       <motion.tr 
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: i * 0.05 }}
                         key={student.id} 
                         className="hover:bg-black font-bold group cursor-default transition-colors"
                       >
                          <td className="px-10 py-6 text-black group-hover:text-white uppercase tracking-tight text-sm">{student.name}</td>
                          <td className="px-10 py-6 text-black/40 group-hover:text-white/40 uppercase text-[10px] tracking-widest">{student.dept}</td>
                          <td className="px-10 py-6 font-black text-lg group-hover:text-[#0066FF] transition-colors italic">{student.cgpa}</td>
                          <td className="px-10 py-6">
                             <span className={cn(
                               "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2",
                               student.activeBacklogs > 0 
                                ? "bg-red-500/10 text-red-600 border-red-500/20 group-hover:bg-red-500 group-hover:text-white group-hover:border-white/20" 
                                : "bg-green-500/10 text-green-600 border-green-500/20 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-white/20"
                             )}>
                               {student.activeBacklogs > 0 ? `${student.activeBacklogs} ACTIVE ERR` : "CERTIFIED CLEAR"}
                             </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button className="p-3 rounded-xl hover:bg-white/10 text-black/20 group-hover:text-white transition-all">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                       </motion.tr>
                     ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-black text-white p-12 rounded-[4rem] group cursor-pointer shadow-2xl hover:shadow-[#FF8A00]/20 transition-all border-4 border-transparent hover:border-[#FF8A00]/20 text-center">
              <div className="w-24 h-24 rounded-[2.5rem] bg-[#FF8A00] flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:rotate-12 transition-all">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">IMPORT SYNC</h3>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-8">
                Bulk synchronize candidate records via official CSV/XLS metrics pipeline.
              </p>
              <button className="w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-[#0066FF] hover:text-white transition-all shadow-xl">
                SELECT ARCHIVE <ArrowUpRight className="inline ml-2 w-4 h-4" />
              </button>
           </div>

           <div className="bg-[#f4f4f5] p-10 rounded-[3.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4 mb-8">
                 <ShieldAlert className="w-8 h-8 text-[#FF8A00]" />
                 <h3 className="text-2xl font-black tracking-tighter uppercase italic">NOTIFICATIONS</h3>
              </div>
              <ul className="space-y-6">
                 <li className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#FF8A00] mt-1.5 shrink-0 shadow-lg shadow-[#FF8A00]/40" />
                    <span className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-wider">12 students have unverified document links.</span>
                 </li>
                 <li className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-black/10 mt-1.5 shrink-0" />
                    <span className="text-xs font-bold text-black/20 leading-relaxed uppercase tracking-wider italic">Google Drive sync reaching limits.</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string, value: string, sub: string, icon: ReactNode, color: string }) {
  return (
    <div className="bg-black text-white jobia-card group border-black/5 hover:bg-[#0066FF] transition-all">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group-hover:text-white/60">{label}</span>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all")} style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>
      <div className="text-6xl font-black mb-2 tracking-tighter leading-none">{value}</div>
      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white/60">{sub}</p>
    </div>
  );
}
