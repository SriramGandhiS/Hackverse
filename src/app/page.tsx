"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GraduationCap, ChevronRight, Star, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const marqueeItems = [
    "VERBAL", "APTITUDE", "REASONING", "PLACEMENT 2026", "CODING", "SOFT SKILLS",
    "VERBAL", "APTITUDE", "REASONING", "PLACEMENT 2026", "CODING", "SOFT SKILLS"
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#0066FF]/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase leading-none">PSNA | <span className="text-[#0066FF]">PLACEMENTFRIEND</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-black/60">
            <Link href="#platform" className="hover:text-black transition-colors">Platform</Link>
          </div>
          <Link href="/auth/login" className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8"
            >
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-10 text-balance">
                YOUR FUTURE <span className="text-[#0066FF]">STARTS</span> <br />
                RIGHT HERE AT <br />
                <span className="text-[#FF8A00]">PSNA COLLEGE</span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 lg:pt-4"
            >
              <p className="text-xl text-black/60 font-medium leading-relaxed mb-8 max-w-sm">
                The official AI-powered placement portal of PSNA College. Manage your career profile and connect with top recruiters seamlessly.
              </p>
              <Link href="/auth/login" className="inline-flex items-center gap-4 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#FF8A00] transition-colors group">
                Get Started
                <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Feature Cards Container */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative items-end">
            <div className="space-y-8">
              <div className="flex flex-col gap-1">
                <span className="text-5xl font-black">12+</span>
                <span className="text-sm font-bold uppercase tracking-widest text-black/40">Completed Projects</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-5xl font-black">8K+</span>
                <span className="text-sm font-bold uppercase tracking-widest text-black/40">Student Success</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-5xl font-black">4.3K+</span>
                <span className="text-sm font-bold uppercase tracking-widest text-black/40">Company Partners</span>
              </div>
            </div>

            <motion.div 
              whileHover={{ rotate: 1, scale: 1.02 }}
              className="bg-[#FF8A00] jobia-card -rotate-2 shadow-2xl shadow-[#FF8A00]/40 -mb-12"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-12">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-white leading-tight mb-4">Extensible &<br />Secure</h3>
              <p className="text-white/80 font-medium mb-8">Lorem ipsum dolor sit amet consec tetur. Sed do eiusmod.</p>
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center text-white">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ rotate: -1, scale: 1.04 }}
              className="bg-[#0066FF] jobia-card rotate-3 shadow-2xl shadow-[#0066FF]/40 mb-12"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-12">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-white leading-tight mb-4">Extensible &<br />Secure</h3>
              <p className="text-white/80 font-medium mb-8">Lorem ipsum dolor sit amet consec tetur. Sed do eiusmod.</p>
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center text-white">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="bg-black py-16 mt-32 overflow-hidden border-y border-white/10">
        <div className="marquee-container">
          <div className="marquee-content">
            {marqueeItems.concat(marqueeItems).map((item, i) => (
              <div key={i} className="flex items-center gap-10">
                <span className="text-7xl font-black text-white tracking-tighter uppercase">{item}</span>
                <Star className="w-12 h-12 text-[#FF8A00] fill-[#FF8A00]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <footer className="bg-black text-white py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 leading-none">
            READY TO START <br />
            <span className="text-outline">YOUR JOURNEY?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/auth/login" className="bg-[#FF8A00] text-white px-12 py-6 rounded-3xl font-black italic tracking-[0.2em] transform hover:scale-105 transition-all shadow-xl shadow-[#FF8A00]/20">
              STUDENT LOGIN
            </Link>
            <Link href="/dashboard/admin" className="bg-white text-black px-12 py-6 rounded-3xl font-black italic tracking-[0.2em] transform hover:scale-105 transition-all shadow-xl shadow-white/10">
              OFFICER LOGIN
            </Link>
          </div>
          <p className="mt-20 text-white/20 text-sm font-bold uppercase tracking-widest">
            © 2026 PSNA COLLEGE OF ENGINEERING AND TECHNOLOGY • PLACEMENT CELL
          </p>
        </div>
      </footer>
    </div>
  );
}
