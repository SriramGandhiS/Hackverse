"use client";

import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Globe, 
  ExternalLink, 
  Award,
  BookOpen,
  Code,
  Briefcase,
  Star,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { useEffect, useState, ReactNode } from "react";
import React from "react";
import { fetchFromGAS } from "@/lib/api";
import { Student } from "@/lib/matching";
import Link from "next/link";

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem("spos_user_id");
    async function loadData() {
      const data = await fetchFromGAS('getStudents');
      const currentStudent = data.find((s: any) => String(s.id) === savedId);
      setStudent(currentStudent);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !student) return <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">Accessing Portfolio...</div>;

  return (
    <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Profile Header */}
      <div className="relative group">
        <div className="absolute inset-0 bg-black rounded-[4rem] transform -rotate-1 group-hover:rotate-0 transition-transform duration-500 shadow-2xl" />
        <div className="relative bg-white border-4 border-black rounded-[4rem] p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 hover:translate-y-[-10px] hover:translate-x-[10px] transition-all duration-500">
           <div className="w-48 h-48 rounded-[3rem] bg-[#0066FF] flex items-center justify-center text-white text-7xl font-black shadow-2xl relative overflow-hidden">
               {student.name[0]}
               <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-2xl rounded-full -mr-10 -mt-10" />
           </div>
           <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">{student.name}</h1>
                <div className="px-6 py-2 rounded-full bg-[#FF8A00] text-white text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">Verified Candidate</div>
              </div>
              <p className="text-2xl text-black/40 font-bold uppercase tracking-[0.2em] mb-8">{student.dept} • BATCH OF 2026</p>
              
              <div className="flex wrap justify-center md:justify-start gap-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-[#0066FF]"><Mail className="w-5 h-5" /></div>
                    <span className="text-xs font-black uppercase tracking-widest">{student.name.toLowerCase().replace(' ', '.')}@psnacet.edu</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-[#FF8A00]"><MapPin className="w-5 h-5" /></div>
                    <span className="text-xs font-black uppercase tracking-widest text-black/60">DINDIGUL, TN</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Core Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-[#f4f4f5] p-10 rounded-[3.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/40 mb-10 italic">Academic Pulse</h3>
              <div className="space-y-12">
                 <div className="flex items-end gap-1">
                    <span className="text-8xl font-black leading-none tracking-tighter">{student.cgpa}</span>
                    <span className="text-xl font-black text-[#0066FF] mb-2">GPA</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white border-2 border-black/5">
                       <div className="text-2xl font-black mb-1">{student.activeBacklogs}</div>
                       <div className="text-[8px] font-black uppercase tracking-widest text-black/40 text-nowrap">ARRERS</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border-2 border-black/5">
                       <div className="text-2xl font-black mb-1">{student.certifications}</div>
                       <div className="text-[8px] font-black uppercase tracking-widest text-black/40 text-nowrap">BADGES</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-black p-10 rounded-[3.5rem] text-white">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-10 italic">External Connections</h3>
              <div className="space-y-4">
                  {student.githubLink && (
                    <Link href={student.githubLink} target="_blank" className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 hover:bg-[#0066FF] transition-all group">
                       <div className="flex items-center gap-4">
                          <Globe className="w-6 h-6 text-[#0066FF] group-hover:text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest">GITHUB PORTAL</span>
                       </div>
                       <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </Link>
                  )}
                  {student.resume_link && (
                    <Link href={student.resume_link} target="_blank" className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 hover:bg-[#FF8A00] transition-all group">
                       <div className="flex items-center gap-4">
                          <ExternalLink className="w-6 h-6 text-[#FF8A00] group-hover:text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest">VERIFIED RESUME</span>
                       </div>
                       <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </Link>
                  )}
              </div>
           </div>
        </div>

        {/* Right Column - Skills & Accomplishments */}
        <div className="lg:col-span-8 space-y-12">
            <div>
               <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-4">
                 <Code className="w-10 h-10 text-[#0066FF]" /> TECHNICAL <span className="text-outline border-black text-black">STACK</span>
               </h2>
               <div className="flex wrap gap-4">
                  {student.skills.map((skill, i) => (
                    <motion.div 
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-8 py-4 rounded-2xl bg-[#0066FF] text-white text-xs font-black uppercase tracking-[0.15em] shadow-xl shadow-[#0066FF]/20 hover:scale-110 hover:bg-[#FF8A00] hover:shadow-[#FF8A00]/40 transition-all cursor-default"
                    >
                      {skill}
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="pt-12 border-t-4 border-black/5">
               <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-4">
                 <Award className="w-10 h-10 text-[#FF8A00]" /> VERIFIED <span className="text-outline border-black text-black">AWARDS</span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkillItem 
                    icon={<Briefcase />} 
                    title="HACKATHONS" 
                    value={student.hackathons.toString()} 
                    desc="Competitive development high-score." 
                  />
                  <SkillItem 
                    icon={<Star />} 
                    title="PATENTS" 
                    value={(student as any).patents?.toString() || "0"} 
                    desc="Research & Innovation patents filed." 
                  />
               </div>
            </div>

            <div className="p-12 rounded-[4rem] bg-black text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/20 to-transparent pointer-events-none" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                     <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">CAREER INTENSITY</h3>
                     <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Candidate Readiness Level 04</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#FF8A00] shadow-xl"><ChevronRight className="w-10 h-10" /></div>
                     <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-xl">84%</div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function SkillItem({ icon, title, value, desc }: { icon: ReactNode, title: string, value: string, desc: string }) {
  return (
    <div className="bg-[#f4f4f5] p-10 rounded-[3rem] hover:bg-[#0066FF] hover:text-white transition-all group">
       <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all">{icon}</div>
          <span className="text-4xl font-black italic tracking-tighter">{value}</span>
       </div>
       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 group-hover:text-white/60">{title}</h4>
       <p className="text-xs font-bold text-black/40 leading-relaxed group-hover:text-white/40">{desc}</p>
    </div>
  );
}
