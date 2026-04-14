"use client";

import { Sidebar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchFromGAS } from "@/lib/api";

function TopBar() {
  const router = useRouter();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const savedId = localStorage.getItem("spos_user_id");
    if (!savedId) return;
    fetchFromGAS("getStudents").then((data: any[]) => {
      const s = data.find((x: any) => String(x.id) === savedId);
      if (s) setName(s.name);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spos_user_id");
    localStorage.removeItem("spos_user_role");
    router.push("/auth/login");
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b-2 border-black/5 px-8 py-4 flex items-center justify-between">
      {/* Left: branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#0066FF] flex items-center justify-center shadow-md shadow-[#0066FF]/20">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-black text-xs uppercase tracking-[0.25em] text-black">PSNA</span>
          <span className="font-black text-xs uppercase tracking-[0.25em] text-[#0066FF] ml-1">PlacementFriend</span>
        </div>
      </div>

      {/* Right: student name + logout */}
      <div className="flex items-center gap-4">
        {name && (
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-[#f4f4f5]">
            <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-[9px] font-black">
              {name[0]}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all group"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar with logout */}
        <TopBar />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
