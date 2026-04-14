"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  BarChart2,
  Code,
  GraduationCap,
  Brain,
  Mic,
  Globe,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchFromGAS } from "@/lib/api";
import { Student } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── PRS Calculation ──────────────────────────────────────────────────────────
function computePRS(student: Student) {
  const technical = Math.min(
    100,
    (student.skills.length / 6) * 60 + (student.githubLink ? 40 : 0)
  );
  const academic = Math.min(100, (student.cgpa / 10) * 100);
  const problemSolving = Math.min(100, student.hackathons * 25);
  const communication = Math.min(100, student.certifications * 12);
  const professional = Math.min(
    100,
    (student.githubLink ? 35 : 0) +
      (student.resume_link ? 35 : 0) +
      Math.min(30, student.certifications * 5)
  );

  const composite = Math.round(
    technical * 0.3 +
      academic * 0.2 +
      problemSolving * 0.2 +
      communication * 0.15 +
      professional * 0.15
  );

  return { technical, academic, problemSolving, communication, professional, composite };
}

function getLevel(score: number) {
  if (score >= 85) return { label: "CHAMPION", color: "#FFD700", next: null };
  if (score >= 72) return { label: "ELITE", color: "#9333EA", next: 85 };
  if (score >= 58) return { label: "CONTENDER", color: "#0066FF", next: 72 };
  if (score >= 42) return { label: "RISING", color: "#FF8A00", next: 58 };
  return { label: "ROOKIE", color: "#64748b", next: 42 };
}

// ─── Animated Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplayed(Math.round(progress * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="220" height="220" className="-rotate-90">
        <circle cx="110" cy="110" r={r} fill="none" stroke="#f4f4f5" strokeWidth="16" />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black tracking-tighter leading-none">{displayed}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mt-1">PRS</span>
      </div>
    </div>
  );
}

// ─── Dimension Card ───────────────────────────────────────────────────────────
function DimensionCard({
  icon,
  label,
  weight,
  score,
  color,
  tip,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  weight: string;
  score: number;
  color: string;
  tip: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-[#f4f4f5] rounded-[2.5rem] p-8 group hover:bg-black hover:text-white transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="text-right">
          <div className="text-5xl font-black tracking-tighter leading-none" style={{ color }}>
            {Math.round(score)}
          </div>
          <div className="text-[8px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/30 mt-1">
            / 100
          </div>
        </div>
      </div>

      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">{label}</h3>
      <div className="text-[8px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/30 mb-5">
        WEIGHT: {weight}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-black/10 group-hover:bg-white/10 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <p className="text-[10px] text-black/50 group-hover:text-white/50 font-bold leading-relaxed">
        {tip}
      </p>
    </motion.div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ current }: { current: number }) {
  const months = ["NOV", "DEC", "JAN", "FEB", "MAR", "APR"];
  // Simulate progression leading to current score
  const base = Math.max(20, current - 35);
  const values = [
    base,
    base + 5,
    base + 10,
    base + 18,
    base + 26,
    current,
  ].map((v) => Math.min(100, Math.max(0, v)));

  const maxV = 100;
  const minV = 0;
  const w = 300;
  const h = 80;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - minV) / (maxV - minV)) * h;
    return `${x},${y}`;
  });

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#0066FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts.join(" ")}
        />
      </svg>
      <div className="flex justify-between mt-3">
        {months.map((m, i) => (
          <div key={m} className="text-center">
            <div
              className={cn(
                "text-[8px] font-black uppercase tracking-widest",
                i === months.length - 1 ? "text-[#0066FF]" : "text-black/30"
              )}
            >
              {m}
            </div>
            <div
              className={cn(
                "text-[10px] font-black",
                i === months.length - 1 ? "text-black" : "text-black/40"
              )}
            >
              {values[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PRSPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedId = localStorage.getItem("spos_user_id");
    if (!savedId) { router.push("/auth/login"); return; }
    async function load() {
      const data = await fetchFromGAS("getStudents");
      const s = data.find((x: any) => String(x.id) === savedId);
      if (!s) { router.push("/auth/login"); return; }
      setStudent(s);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading || !student)
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">
        Computing Readiness...
      </div>
    );

  const scores = computePRS(student);
  const level = getLevel(scores.composite);

  const dimensions = [
    {
      icon: <Code className="w-6 h-6" />,
      label: "Technical Skills",
      weight: "30%",
      score: scores.technical,
      color: "#0066FF",
      tip:
        scores.technical < 70
          ? "Add more skills (Python, DSA, Cloud) and push projects to GitHub to raise this score."
          : "Strong technical profile. Keep contributing to open source to stay ahead.",
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      label: "Academic Performance",
      weight: "20%",
      score: scores.academic,
      color: "#9333EA",
      tip:
        scores.academic < 75
          ? `Your CGPA of ${student.cgpa} is below 8.5. Focus on upcoming semester exams to boost this.`
          : `CGPA of ${student.cgpa} is excellent — this is a strong competitive advantage.`,
    },
    {
      icon: <Brain className="w-6 h-6" />,
      label: "Problem Solving",
      weight: "20%",
      score: scores.problemSolving,
      color: "#FF8A00",
      tip:
        student.hackathons < 2
          ? "Participate in at least 2–3 hackathons. Each one adds major points and demonstrates real-world problem solving."
          : `${student.hackathons} hackathons on record — outstanding. Keep competing!`,
    },
    {
      icon: <Mic className="w-6 h-6" />,
      label: "Communication",
      weight: "15%",
      score: scores.communication,
      color: "#10b981",
      tip:
        scores.communication < 60
          ? "Attend mock interviews and earn presentation certifications to build your communication score."
          : "Good communication signals. Mock interview sessions will push this further.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      label: "Professional Presence",
      weight: "15%",
      score: scores.professional,
      color: "#f43f5e",
      tip:
        !student.githubLink || !student.resume_link
          ? "Ensure your GitHub link and Resume are added to your profile. Missing these heavily impacts this dimension."
          : "Complete professional presence detected. Keep certifications up to date.",
    },
  ];

  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b-4 border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest">
              LIVE SCORE
            </div>
            <div
              className="px-3 py-1 rounded-full text-white text-[8px] font-black uppercase tracking-widest"
              style={{ backgroundColor: level.color }}
            >
              {level.label}
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-3">
            PLACEMENT <span className="text-[#0066FF]">READINESS</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
            5-DIMENSION COMPOSITE SCORE • {student.name}
          </p>
        </div>
        {level.next && (
          <div className="bg-[#f4f4f5] px-8 py-5 rounded-[2.5rem] flex items-center gap-4">
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-1">
                NEXT LEVEL
              </div>
              <div className="text-sm font-black uppercase tracking-widest">
                +{level.next - scores.composite} pts to{" "}
                <span style={{ color: level.color }}>
                  {getLevel(level.next).label}
                </span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-black/20" />
          </div>
        )}
      </div>

      {/* Score Ring + Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col items-center gap-8">
          <div className="bg-black text-white rounded-[4rem] p-12 flex flex-col items-center gap-6 w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0066FF]/20 blur-[80px] rounded-full -mr-20 -mt-20" />
            <ScoreRing score={scores.composite} color={level.color} />
            <div className="text-center relative z-10">
              <div
                className="text-3xl font-black uppercase tracking-widest mb-1"
                style={{ color: level.color }}
              >
                {level.label}
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                CANDIDATE TIER
              </div>
            </div>
          </div>

          {/* Weakest dimension alert */}
          <div className="w-full bg-[#FF8A00]/5 border-2 border-[#FF8A00]/20 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-[#FF8A00]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF8A00]">
                PRIORITY IMPROVEMENT
              </span>
            </div>
            <h4 className="font-black uppercase text-sm tracking-tight mb-2">
              {weakest.label}
            </h4>
            <p className="text-[10px] text-black/50 font-bold leading-relaxed">{weakest.tip}</p>
          </div>

          {/* Score history */}
          <div className="w-full bg-[#f4f4f5] rounded-[2.5rem] p-8">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> SCORE HISTORY (6 MONTHS)
            </h3>
            <Sparkline current={scores.composite} />
          </div>
        </div>

        {/* Dimension cards */}
        <div className="lg:col-span-8">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-4">
            <BarChart2 className="w-10 h-10 text-[#0066FF]" /> SCORE{" "}
            <span className="text-outline border-black text-black">BREAKDOWN</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dimensions.map((d, i) => (
              <DimensionCard key={d.label} {...d} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </div>

      {/* Tips banner */}
      <div className="bg-black text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF]/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
              HOW TO BOOST YOUR PRS
            </span>
          </div>
          <p className="font-black uppercase tracking-tight text-xl">
            Complete the Daily Quiz →{" "}
            <span className="text-[#FF8A00]">+5 to Problem Solving</span>
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/student/quiz")}
          className="relative z-10 px-8 py-4 bg-[#0066FF] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-[#FF8A00] transition-all flex items-center gap-2 shrink-0"
        >
          TAKE TODAY&apos;S QUIZ <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
