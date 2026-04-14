"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Loader2, AlertCircle, Stars } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchFromGAS } from "@/lib/api";

export default function LoginPage() {
  const [registerNumber, setRegisterNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!registerNumber) return;

    setLoading(true);
    setError("");

    try {
      const students = await fetchFromGAS('getStudents');
      const student = students.find((s: any) => {
        const studentId = String(s.id).replace(/\.0$/, "");
        const inputId = String(registerNumber).trim().replace(/\.0$/, "");
        return studentId === inputId;
      });

      if (student) {
        localStorage.setItem("spos_user_id", student.id);
        localStorage.setItem("spos_user_role", "student");
        router.push("/dashboard/student");
      } else {
        setError("REGISTER NUMBER NOT FOUND. PLEASE CHECK YOUR DATA.");
      }
    } catch (err) {
      setError("SYSTEM CONNECTION ERROR. FALLING BACK TO MOCKED DATA...");
      // In a real scenario we'd handle this better, but for this UX we just alert
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-[#0066FF]/20">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0066FF]/5 skew-x-12 transform origin-top-right transition-all" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-[#FF8A00]/5 -skew-x-12 transform origin-bottom-left transition-all" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl border-4 border-white/10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-[#0066FF] flex items-center justify-center shadow-xl shadow-[#0066FF]/20 mx-auto mb-8">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">PSNA ACCESS</h1>
            <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Placement Portal • Verification Core</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 ml-1">Student Register Number</label>
              <input
                type="text"
                placeholder="2303921310421..."
                required
                className="w-full bg-black/5 border-2 border-black/5 rounded-[2rem] px-8 py-6 text-black font-black text-xl outline-none focus:border-[#0066FF] focus:ring-8 focus:ring-[#0066FF]/5 transition-all placeholder:text-black/10 tracking-wider"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-red-500/5 border-2 border-red-500/20 text-red-600 text-xs font-black uppercase tracking-wider italic"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              disabled={loading}
              className="w-full bg-black hover:bg-[#FF8A00] text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-[#FF8A00]/20 disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  AUTHORIZE ACCESS <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 flex items-center justify-between pt-8 border-t-2 border-black/5">
             <button 
              onClick={() => router.push("/")}
              className="text-xs font-black uppercase tracking-widest text-black/40 hover:text-[#0066FF] transition-colors"
            >
              ← System Home
            </button>
            <div className="flex items-center gap-2 text-[#FF8A00]">
              <Stars className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Version 2.5 Live</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                Encrypted Session • SECURE CHANNEL 04
            </p>
        </div>
      </motion.div>
    </div>
  );
}
