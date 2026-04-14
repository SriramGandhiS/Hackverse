"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Star,
  GitFork,
  Code2,
  ExternalLink,
  RefreshCcw,
  AlertCircle,
  ArrowUpRight,
  Flame,
  Clock,
  CheckCircle2,
  Lock,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";
import { fetchFromGAS } from "@/lib/api";
import { Student } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;   // ← first push / repo creation date
  pushed_at: string;    // ← last push date
  updated_at: string;
  topics: string[];
  visibility: string;
  fork: boolean;
  size: number;
  default_branch: string;
  open_issues_count: number;
}

// ─── Language colour map ──────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  JavaScript: "#F7DF1E",
  TypeScript: "#3178C6",
  Python: "#3572A5",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
  "C#": "#178600",
  PHP: "#4F5D95",
  "Jupyter Notebook": "#DA5B0B",
};

function langColor(lang: string | null) {
  if (!lang) return "#6b7280";
  return LANG_COLORS[lang] ?? "#6b7280";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Repo Card ────────────────────────────────────────────────────────────────
function RepoCard({ repo, delay }: { repo: GithubRepo; delay: number }) {
  const color = langColor(repo.language);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-black text-white rounded-[2.5rem] p-8 group relative overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl"
      onClick={() => window.open(repo.html_url, "_blank")}
    >
      {/* Language glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 blur-[100px] rounded-full -mr-20 -mt-20 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top row: icon + badges + external link */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: `${color}25` }}
          >
            <Code2 className="w-5 h-5" style={{ color }} />
          </div>
          {repo.fork && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
              FORK
            </span>
          )}
          {repo.visibility === "private" && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 text-white/30">
              <Lock className="w-3 h-3" /> PRIVATE
            </span>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
      </div>

      {/* Repo name */}
      <h3 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-[#FF8A00] transition-colors relative z-10 leading-tight">
        {repo.name}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-white/40 font-bold leading-relaxed mb-5 relative z-10 flex-1 line-clamp-2">
        {repo.description ?? "No description provided."}
      </p>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* ── Date row ── */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="bg-white/5 rounded-2xl px-4 py-3 group-hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarPlus className="w-3 h-3 text-[#0066FF]" />
            <span className="text-[7px] font-black uppercase tracking-widest text-white/30">FIRST PUSHED</span>
          </div>
          <span className="text-[10px] font-black text-white/70">{formatDate(repo.created_at)}</span>
        </div>
        <div className="bg-white/5 rounded-2xl px-4 py-3 group-hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarClock className="w-3 h-3 text-[#FF8A00]" />
            <span className="text-[7px] font-black uppercase tracking-widest text-white/30">LAST PUSHED</span>
          </div>
          <span className="text-[10px] font-black text-white/70">{formatDate(repo.pushed_at)}</span>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between pt-5 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                {repo.language}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-white/30">
            <Star className="w-3 h-3" />
            <span className="text-[9px] font-black">{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1 text-white/30">
            <GitFork className="w-3 h-3" />
            <span className="text-[9px] font-black">{repo.forks_count}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/20">
          <Clock className="w-3 h-3" />
          <span className="text-[8px] font-black">{timeAgo(repo.pushed_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-black text-white px-7 py-5 rounded-[2rem] flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black tracking-tighter leading-none">{value}</div>
        <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GithubProjectsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterLang, setFilterLang] = useState("ALL");
  const [showForksOnly, setShowForksOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"pushed" | "created" | "stars" | "forks">("pushed");

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

  useEffect(() => {
    if (!student?.githubLink) return;
    fetchRepos(student.githubLink);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  async function fetchRepos(link: string) {
    setFetching(true);
    setError(null);
    try {
      const username = link.replace(/\/$/, "").split("/").pop();
      if (!username) throw new Error("Could not extract GitHub username from the stored link.");
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error(`GitHub user '${username}' not found. Check the profile link.`);
        if (res.status === 403) throw new Error("GitHub API rate limit exceeded. Try again in a minute.");
        throw new Error(`GitHub API error: ${res.status}`);
      }
      const data: GithubRepo[] = await res.json();
      setRepos(data);
    } catch (err: any) {
      setError(err.message ?? "Unknown error fetching repos.");
    } finally {
      setFetching(false);
    }
  }

  if (loading || !student)
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-widest text-[#0066FF] animate-pulse">
        Connecting to GitHub...
      </div>
    );

  if (!student.githubLink)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-8">
        <div className="w-24 h-24 rounded-[2rem] bg-[#f4f4f5] flex items-center justify-center">
          <GitBranch className="w-12 h-12 text-black/20" />
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-3">NO GITHUB LINKED</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 max-w-xs leading-relaxed">
            Your profile has no GitHub link. Contact your placement coordinator to add it.
          </p>
        </div>
      </div>
    );

  const username = student.githubLink.replace(/\/$/, "").split("/").pop() ?? "";
  const allLangs = ["ALL", ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))];
  const originalCount = repos.filter(r => !r.fork).length;
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const topLang = allLangs.slice(1).reduce(
    (best, lang) => {
      const n = repos.filter(r => r.language === lang).length;
      return n > best.n ? { lang, n } : best;
    },
    { lang: "—", n: 0 }
  );

  const filtered = repos
    .filter(r => filterLang === "ALL" || r.language === filterLang)
    .filter(r => !showForksOnly || r.fork)
    .sort((a, b) => {
      if (sortBy === "stars")   return b.stargazers_count - a.stargazers_count;
      if (sortBy === "forks")   return b.forks_count - a.forks_count;
      if (sortBy === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(); // default: last push
    });

  return (
    <div className="space-y-10 pb-24 p-8 bg-white min-h-screen text-black font-sans selection:bg-[#0066FF]/20">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b-4 border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest">LIVE API</div>
            <a
              href={student.githubLink} target="_blank" rel="noreferrer"
              className="px-3 py-1 rounded-full bg-[#0066FF] text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-[#FF8A00] transition-colors"
            >
              @{username} <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-2">
            GITHUB <span className="text-[#0066FF]">PROJECTS</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">{student.name} • ALL REPOSITORIES</p>
        </div>
        <button
          onClick={() => fetchRepos(student.githubLink!)}
          disabled={fetching}
          className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#0066FF] transition-all disabled:opacity-30 shrink-0"
        >
          <RefreshCcw className={cn("w-4 h-4", fetching && "animate-spin")} />
          {fetching ? "SYNCING..." : "SYNC REPOS"}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-4 p-8 rounded-[2rem] bg-red-500/5 border-2 border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">SYNC ERROR</div>
              <p className="text-sm font-bold text-red-600/70">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {fetching && repos.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#f4f4f5] rounded-[2.5rem] h-72 animate-pulse" />
          ))}
        </div>
      )}

      {/* Data loaded */}
      {!fetching && repos.length > 0 && (
        <>
          {/* ── Stat pills ── */}
          <div className="flex flex-wrap gap-4">
            <StatPill icon={<GitBranch className="w-4 h-4" />}   label="TOTAL REPOS"  value={repos.length}       color="#0066FF" />
            <StatPill icon={<Code2 className="w-4 h-4" />}    label="ORIGINAL"     value={originalCount}      color="#9333EA" />
            <StatPill icon={<Star className="w-4 h-4" />}     label="TOTAL STARS"  value={totalStars}         color="#FF8A00" />
            <StatPill icon={<Flame className="w-4 h-4" />}    label="TOP LANGUAGE" value={topLang.lang}       color="#ef4444" />
          </div>

          {/* ── Controls bar ── */}
          <div className="bg-[#f4f4f5] rounded-[2rem] p-5 flex flex-wrap gap-6 items-center">
            {/* Language filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[8px] font-black uppercase tracking-widest text-black/30 mr-1">LANG</span>
              {allLangs.map(lang => (
                <button
                  key={lang}
                  onClick={() => setFilterLang(lang)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    filterLang === lang ? "bg-black text-white" : "bg-white text-black/40 hover:text-black"
                  )}
                >
                  {lang === "ALL" ? "ALL" : (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor(lang) }} />
                      {lang}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-black/10" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-black/30 mr-1">SORT</span>
              {(["pushed", "created", "stars", "forks"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    sortBy === s ? "bg-black text-white" : "bg-white text-black/40 hover:text-black"
                  )}
                >
                  {s === "pushed" ? "LAST PUSH" : s === "created" ? "CREATED" : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-black/30">
              SHOWING {filtered.length} OF {repos.length} REPOSITORIES
            </span>
          </div>

          {/* ── Repo grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} delay={Math.min(i * 0.04, 0.6)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-black/20 font-black uppercase tracking-widest text-sm">
              NO REPOSITORIES MATCH THIS FILTER
            </div>
          )}
        </>
      )}

      {/* Empty / pre-load state */}
      {!fetching && repos.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-[#f4f4f5] flex items-center justify-center">
            <GitBranch className="w-10 h-10 text-black/15" />
          </div>
          <p className="font-black uppercase tracking-widest text-black/20 text-sm text-center">
            CLICK &quot;SYNC REPOS&quot; TO LOAD YOUR GITHUB PROJECTS
          </p>
        </div>
      )}
    </div>
  );
}
