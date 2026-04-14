"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  UserCircle, 
  LogOut,
  GraduationCap,
  ArrowRight,
  BarChart2,
  Brain,
  FileText,
  GitBranch,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "COMMAND CENTER", icon: LayoutDashboard, href: "/dashboard/student" },
  { name: "RECRUITERS", icon: Building2, href: "/dashboard/student/companies" },
  { name: "PORTFOLIO", icon: UserCircle, href: "/dashboard/student/profile" },
  { name: "PRS SCORE", icon: BarChart2, href: "/dashboard/student/prs" },
  { name: "DAILY QUIZ", icon: Brain, href: "/dashboard/student/quiz" },
  { name: "RESUME AI", icon: FileText, href: "/dashboard/student/resume" },
  { name: "GITHUB", icon: GitBranch, href: "/dashboard/student/github" },
  { name: "MOCK INTERVIEW", icon: Mic, href: "/dashboard/student/interview" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("spos_user_id");
    localStorage.removeItem("spos_user_role");
    router.push("/auth/login");
  };

  return (
    <div className="w-80 bg-white border-r-4 border-black/5 h-screen sticky top-0 flex flex-col p-8 selection:bg-[#0066FF]/20">
      <div className="mb-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0066FF] flex items-center justify-center shadow-lg shadow-[#0066FF]/20 shrink-0">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none">PSNA</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0066FF]">PLACEMENTFRIEND</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-6 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-black text-white shadow-xl translate-x-2" 
                  : "text-black/40 hover:text-black hover:bg-black/5"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-[#FF8A00]" : "transition-colors"
                )} />
                {item.name}
              </div>
              {isActive && (
                <ArrowRight className="w-4 h-4 text-white relative z-10" />
              )}
              {isActive && (
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0066FF]/20 skew-x-12 translate-x-8" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 mt-8 border-t-2 border-black/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-5 w-full rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] text-black/40 hover:bg-red-500/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          DISCONNECT
        </button>
      </div>

    </div>
  );
}
