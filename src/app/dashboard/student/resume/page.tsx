"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Building2,
  Download,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Eye,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";
import { fetchFromGAS } from "@/lib/api";
import { Student, Company } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── Resume Generator ─────────────────────────────────────────────────────────
function generateTailoredResume(student: Student, company: Company, rawText: string): string {
  const prioritySkills = company.prioritySkills;
  const requiredSkills = company.requiredSkills;

  // Sort student skills: priority first, then required, then rest
  const sorted = [...student.skills].sort((a, b) => {
    const aP = prioritySkills.some(p => p.toLowerCase() === a.toLowerCase()) ? 0 :
               requiredSkills.some(r => r.toLowerCase() === a.toLowerCase()) ? 1 : 2;
    const bP = prioritySkills.some(p => p.toLowerCase() === b.toLowerCase()) ? 0 :
               requiredSkills.some(r => r.toLowerCase() === b.toLowerCase()) ? 1 : 2;
    return aP - bP;
  });

  const matchedRequired = requiredSkills.filter(rs =>
    student.skills.some(ss => ss.toLowerCase() === rs.toLowerCase())
  );
  const matchedPriority = prioritySkills.filter(ps =>
    student.skills.some(ss => ss.toLowerCase() === ps.toLowerCase())
  );

  const domain = student.domain || sorted[0] || "Software Development";

  const objective = `To secure a ${company.name} role where I can leverage my expertise in ${sorted.slice(0, 3).join(", ")} to deliver high-impact solutions. Committed to contributing ${matchedPriority.length > 0 ? `particularly in ${matchedPriority.join(" and ")}` : ""} while growing within a world-class engineering environment.`;

  const lines: string[] = [];
  lines.push("=".repeat(60));
  lines.push(student.name.toUpperCase());
  lines.push(`${student.dept} | BATCH OF 2026 | PSNA College of Engineering`);
  lines.push(`Email: ${student.name.toLowerCase().replace(" ", ".")}@psnacet.edu`);
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("OBJECTIVE");
  lines.push("-".repeat(40));
  lines.push(objective);
  lines.push("");
  lines.push(`[TAILORED FOR: ${company.name.toUpperCase()}]`);
  lines.push("");

  lines.push("TECHNICAL SKILLS");
  lines.push("-".repeat(40));
  sorted.forEach(skill => {
    const isPriority = prioritySkills.some(p => p.toLowerCase() === skill.toLowerCase());
    const isRequired = requiredSkills.some(r => r.toLowerCase() === skill.toLowerCase());
    const tag = isPriority ? " ★ PRIORITY MATCH" : isRequired ? " ✓ REQUIRED MATCH" : "";
    lines.push(`• ${skill}${tag}`);
  });

  lines.push("");
  lines.push("ACADEMIC PROFILE");
  lines.push("-".repeat(40));
  lines.push(`CGPA: ${student.cgpa} / 10.0`);
  lines.push(`Active Backlogs: ${student.activeBacklogs}`);
  lines.push(`Department: ${student.dept}`);

  if (student.hackathons > 0) {
    lines.push("");
    lines.push("HACKATHONS & COMPETITIONS");
    lines.push("-".repeat(40));
    lines.push(`• Participated in ${student.hackathons} hackathon${student.hackathons > 1 ? "s" : ""}`);
    lines.push("• Demonstrated problem-solving across real-world engineering challenges");
  }

  if (student.certifications > 0) {
    lines.push("");
    lines.push("CERTIFICATIONS");
    lines.push("-".repeat(40));
    lines.push(`${student.certifications} verified certifications on record`);
    lines.push("(Full list available on request or linked profile)");
  }

  if (student.githubLink) {
    lines.push("");
    lines.push("PORTFOLIO & LINKS");
    lines.push("-".repeat(40));
    lines.push(`GitHub: ${student.githubLink}`);
    if (student.resume_link) lines.push(`Resume: ${student.resume_link}`);
  }

  if (rawText.trim().length > 30) {
    lines.push("");
    lines.push("ADDITIONAL EXPERIENCE (FROM UPLOADED RESUME)");
    lines.push("-".repeat(40));
    // Extract non-empty lines from raw text that look meaningful
    const extras = rawText
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 10 && l.length < 200)
      .slice(0, 8);
    extras.forEach(e => lines.push(`${e}`));
  }

  lines.push("");
  lines.push("=".repeat(60));
  lines.push(`MATCH ANALYSIS FOR ${company.name.toUpperCase()}`);
  lines.push("-".repeat(40));
  lines.push(`Required Skills Matched: ${matchedRequired.length}/${requiredSkills.length}`);
  lines.push(`Priority Skills Matched: ${matchedPriority.length}/${prioritySkills.length}`);
  lines.push(`Min CGPA Requirement: ${company.minCgpa} (Yours: ${student.cgpa})`);
  lines.push(`Backlog Allowance: ${company.allowedBacklogs} (Yours: ${student.activeBacklogs})`);
  lines.push("=".repeat(60));

  return lines.join("\n");
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumeBuilderPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Steps: 1=source, 2=company, 3=output
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawText, setRawText] = useState("");
  const [sourceMode, setSourceMode] = useState<"existing" | "paste">("existing");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [outputResume, setOutputResume] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("spos_user_id");
    if (!savedId) { router.push("/auth/login"); return; }
    async function load() {
      const [students, comps] = await Promise.all([
        fetchFromGAS("getStudents"),
        fetchFromGAS("getCompanies"),
      ]);
      const s = students.find((x: any) => String(x.id) === savedId);
      if (!s) { router.push("/auth/login"); return; }
      setStudent(s);
      setCompanies(comps);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleGenerate = () => {
    if (!student || !selectedCompany) return;
    setGenerating(true);
    // Simulate brief AI-style delay
    setTimeout(() => {
      const resume = generateTailoredResume(student, selectedCompany, rawText);
      setOutputResume(resume);
      setGenerating(false);
      setStep(3);
    }, 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([outputResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student?.name.replace(" ", "_")}_${selectedCompany?.name.replace(" ", "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !student)
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">
        Loading Resume Engine...
      </div>
    );

  const matchedReq = selectedCompany
    ? selectedCompany.requiredSkills.filter(rs =>
        student.skills.some(ss => ss.toLowerCase() === rs.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-10 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">
      {/* Header */}
      <div className="pb-8 border-b-4 border-black/5">
        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest">
            AI ENGINE
          </div>
          <div className="px-3 py-1 rounded-full bg-[#9333EA] text-white text-[8px] font-black uppercase tracking-widest">
            SMART TAILORING
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-3">
          RESUME <span className="text-[#0066FF]">BUILDER</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
          COMPANY-SPECIFIC RESUME GENERATION • {student.name}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {[
          { n: 1, label: "RESUME SOURCE" },
          { n: 2, label: "TARGET COMPANY" },
          { n: 3, label: "TAILORED OUTPUT" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <div
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                step === s.n
                  ? "bg-black text-white"
                  : step > s.n
                  ? "bg-[#0066FF] text-white"
                  : "bg-[#f4f4f5] text-black/30"
              )}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : <span>{s.n}</span>}
              <span className="hidden md:inline">{s.label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-black/20 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Resume Source ─────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4">
              <FileText className="w-8 h-8 text-[#0066FF]" /> YOUR RESUME
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setSourceMode("existing")}
                className={cn(
                  "p-10 rounded-[3rem] border-4 text-left transition-all group",
                  sourceMode === "existing"
                    ? "border-[#0066FF] bg-[#0066FF]/5"
                    : "border-black/5 bg-[#f4f4f5] hover:border-black/20"
                )}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg", sourceMode === "existing" ? "bg-[#0066FF] text-white" : "bg-white text-black")}>
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">USE PROFILE RESUME</h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-relaxed">
                  {student.resume_link
                    ? "Your linked resume will be used as the base document."
                    : "No resume link found in your profile. Use paste option instead."}
                </p>
                {student.resume_link && (
                  <a
                    href={student.resume_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#0066FF] hover:underline"
                  >
                    PREVIEW <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </button>

              <button
                onClick={() => setSourceMode("paste")}
                className={cn(
                  "p-10 rounded-[3rem] border-4 text-left transition-all group flex flex-col",
                  sourceMode === "paste"
                    ? "border-[#9333EA] bg-[#9333EA]/5"
                    : "border-black/5 bg-[#f4f4f5] hover:border-black/20"
                )}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg", sourceMode === "paste" ? "bg-[#9333EA] text-white" : "bg-white text-black")}>
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">PASTE RESUME TEXT</h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-relaxed">
                  Paste the text content of your resume to include additional experience sections.
                </p>
              </button>
            </div>

            {sourceMode === "paste" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <textarea
                  rows={10}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Paste your resume text here... (Experience, Projects, etc.)"
                  className="w-full p-8 rounded-[2rem] bg-[#f4f4f5] border-2 border-black/5 font-mono text-sm resize-none focus:outline-none focus:border-[#9333EA] transition-all"
                />
              </motion.div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={sourceMode === "existing" && !student.resume_link && rawText.trim().length < 5}
              className="px-10 py-5 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#0066FF] transition-all flex items-center gap-3 disabled:opacity-30"
            >
              NEXT: SELECT COMPANY <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Company Selection ─────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4">
              <Building2 className="w-8 h-8 text-[#FF8A00]" /> TARGET COMPANY
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
                const matched = company.requiredSkills.filter(rs =>
                  student.skills.some(ss => ss.toLowerCase() === rs.toLowerCase())
                );
                const pct = company.requiredSkills.length > 0
                  ? Math.round((matched.length / company.requiredSkills.length) * 100)
                  : 100;
                const isSelected = selectedCompany?.id === company.id;

                return (
                  <motion.button
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCompany(company)}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-4 text-left transition-all",
                      isSelected
                        ? "border-[#0066FF] bg-[#0066FF]/5"
                        : "border-black/5 bg-[#f4f4f5] hover:border-black/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg", isSelected ? "bg-[#0066FF] text-white" : "bg-white text-[#0066FF]")}>
                        {company.name[0]}
                      </div>
                      <div className={cn("text-4xl font-black tracking-tighter", pct > 60 ? "text-[#0066FF]" : "text-[#FF8A00]")}>
                        {pct}%
                      </div>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">{company.name}</h3>
                    <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-4">
                      MIN CGPA {company.minCgpa} • {company.allowedBacklogs} BACKLOG ALLOWED
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {company.requiredSkills.slice(0, 3).map(skill => {
                        const has = student.skills.some(s => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={skill}
                            className={cn(
                              "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest",
                              has ? "bg-[#0066FF]/10 text-[#0066FF]" : "bg-black/5 text-black/30"
                            )}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {selectedCompany && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">SELECTED TARGET</div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{selectedCompany.name}</h3>
                  <div className="text-[9px] text-white/40 font-bold mt-1 uppercase tracking-widest">
                    {matchedReq.length}/{selectedCompany.requiredSkills.length} REQUIRED SKILLS MATCHED
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-10 py-5 rounded-[2rem] bg-[#0066FF] text-white font-black text-xs uppercase tracking-widest hover:bg-[#FF8A00] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-wait shrink-0"
                >
                  {generating ? (
                    <>
                      <RefreshCcw className="w-5 h-5 animate-spin" /> GENERATING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> GENERATE RESUME
                    </>
                  )}
                </button>
              </motion.div>
            )}

            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 rounded-[2rem] bg-[#f4f4f5] font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              ← BACK
            </button>
          </motion.div>
        )}

        {/* ── STEP 3: Tailored Output ───────────────────────────────────── */}
        {step === 3 && selectedCompany && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-[#9333EA]" /> TAILORED RESUME
                </h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-2">
                  OPTIMISED FOR {selectedCompany.name.toUpperCase()}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#0066FF] transition-all shrink-0"
              >
                <Download className="w-5 h-5" /> DOWNLOAD .TXT
              </button>
            </div>

            {/* Match Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Required Skills Hit", value: `${matchedReq.length}/${selectedCompany.requiredSkills.length}`, color: "#0066FF" },
                { label: "Priority Skills Hit", value: `${selectedCompany.prioritySkills.filter(ps => student.skills.some(ss => ss.toLowerCase() === ps.toLowerCase())).length}/${selectedCompany.prioritySkills.length}`, color: "#9333EA" },
                { label: "CGPA Eligibility", value: student.cgpa >= selectedCompany.minCgpa ? "✓ PASS" : "✗ FAIL", color: student.cgpa >= selectedCompany.minCgpa ? "#10b981" : "#ef4444" },
              ].map(item => (
                <div key={item.label} className="bg-[#f4f4f5] rounded-[2rem] p-7">
                  <div className="text-3xl font-black tracking-tighter mb-1" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-black/40">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Resume Preview */}
            <div className="bg-[#f4f4f5] rounded-[3rem] p-10 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-5 h-5 text-[#0066FF]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-black/40">RESUME PREVIEW</span>
              </div>
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-black/80 max-h-[600px] overflow-y-auto custom-scrollbar">
                {outputResume}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-[#0066FF] text-white font-black text-xs uppercase tracking-widest hover:bg-[#9333EA] transition-all"
              >
                <Download className="w-5 h-5" /> DOWNLOAD
              </button>
              <button
                onClick={() => { setStep(2); setOutputResume(""); }}
                className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-[#f4f4f5] font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> CHOOSE DIFFERENT COMPANY
              </button>
              <button
                onClick={() => { setStep(1); setOutputResume(""); setSelectedCompany(null); }}
                className="px-8 py-5 rounded-[2rem] bg-[#f4f4f5] font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                START OVER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
