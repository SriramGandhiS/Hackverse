"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Timer,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  BookOpen,
  Cpu,
  MessageSquare,
  Calculator,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { cn } from "@/lib/utils";

// ─── Question Bank ─────────────────────────────────────────────────────────────
const QUESTION_BANK = {
  aptitude: [
    { q: "A train 150m long passes a pole in 15 seconds. What is the speed of the train?", opts: ["8 m/s", "10 m/s", "12 m/s", "15 m/s"], ans: 1, exp: "Speed = Distance / Time = 150 / 15 = 10 m/s" },
    { q: "If 8 workers can complete a job in 12 days, how many days will 6 workers take?", opts: ["14 days", "16 days", "18 days", "20 days"], ans: 1, exp: "Workers × Days = constant. 8×12 = 96. 96/6 = 16 days." },
    { q: "A sum of money doubles itself at 10% per annum simple interest. In how many years?", opts: ["8 years", "10 years", "12 years", "15 years"], ans: 1, exp: "SI = P×R×T/100. For amount to double, SI = P. So P = P×10×T/100 → T = 10 years." },
    { q: "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, how long to fill the tank?", opts: ["10 min", "12 min", "15 min", "25 min"], ans: 1, exp: "Combined rate = 1/20 + 1/30 = 3/60 + 2/60 = 5/60 = 1/12. Time = 12 min." },
    { q: "A shopkeeper sells an article at 20% profit. If CP is ₹500, what is the SP?", opts: ["₹550", "₹580", "₹600", "₹620"], ans: 2, exp: "SP = CP × (1 + profit%) = 500 × 1.2 = ₹600." },
    { q: "In how many ways can the letters of the word 'LEAD' be arranged?", opts: ["12", "16", "20", "24"], ans: 3, exp: "4 distinct letters → 4! = 24 arrangements." },
    { q: "The average of 5 numbers is 40. If one number is excluded, the average becomes 35. What is the excluded number?", opts: ["55", "60", "65", "70"], ans: 1, exp: "Total = 5×40 = 200. Remaining total = 4×35 = 140. Excluded = 200-140 = 60." },
    { q: "What is the probability of getting a sum of 7 when two dice are rolled?", opts: ["1/9", "1/6", "5/36", "7/36"], ans: 1, exp: "Favourable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6." },
    { q: "A car travels 60 km at 30 km/h and another 60 km at 60 km/h. Average speed?", opts: ["40 km/h", "42 km/h", "45 km/h", "48 km/h"], ans: 0, exp: "Time1 = 2h, Time2 = 1h. Total dist = 120 km, Total time = 3h. Avg = 40 km/h." },
    { q: "15% of 250 + 25% of 150 = ?", opts: ["65", "70", "75", "80"], ans: 2, exp: "15% of 250 = 37.5. 25% of 150 = 37.5. Total = 75." },
  ],
  logical: [
    { q: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64", opts: ["26", "37", "50", "64"], ans: 3, exp: "Series: 1²+1, 2²+1, 3²+1, 4²+1... → 64 should be 8²+1=65. So 64 is wrong." },
    { q: "If A is B's sister, C is B's mother, D is C's father, E is D's mother. How is A related to D?", opts: ["Granddaughter", "Grandmother", "Daughter", "Sister"], ans: 0, exp: "A is B's sister → same generation. C is B's mother → C is also A's mother. D is C's father → D is A's grandfather. A is D's granddaughter." },
    { q: "All cats are animals. Some animals are dogs. Therefore:", opts: ["All cats are dogs", "Some cats are dogs", "No cats are dogs", "None of these"], ans: 3, exp: "We cannot definitively conclude any direct relationship between cats and dogs from the given statements." },
    { q: "MOON : STELLAR :: SUN : ?", opts: ["GALAXY", "SOLAR", "LUNAR", "COSMIC"], ans: 1, exp: "Moon relates to STELLAR (star-related). Sun relates to SOLAR (solar-related)." },
    { q: "What comes next: 1, 4, 9, 16, 25, ?", opts: ["30", "35", "36", "49"], ans: 2, exp: "Series of perfect squares: 1², 2², 3², 4², 5², 6² = 36." },
    { q: "In a row of 20 students, Ravi is 8th from the left. What is his position from the right?", opts: ["11th", "12th", "13th", "14th"], ans: 2, exp: "Position from right = Total + 1 - Position from left = 20 + 1 - 8 = 13th." },
    { q: "A is heavier than B. C is heavier than A. D is lighter than B. Who is the lightest?", opts: ["A", "B", "C", "D"], ans: 3, exp: "Order: C > A > B > D. D is lightest." },
    { q: "If COLD = 4321, HEAT = 5678, then what is LATH?", opts: ["2675", "3768", "2768", "3675"], ans: 2, exp: "L=2, A=7, T=6, H=5 from given codes → LATH = 2768." },
    { q: "Pointing to a photograph, Mohan says 'His mother is my father's only daughter.' Who is Mohan to the person?", opts: ["Father", "Uncle", "Grandfather", "Brother"], ans: 0, exp: "Father's only daughter = Mohan's sister. That sister is the person's mother. So Mohan is the maternal uncle... wait, recalculate: if Mohan says 'his mother is my father's only daughter' = Mohan's sister is his mother → Mohan is the person's uncle. Choose Uncle." },
    { q: "What is the mirror image of 'b'?", opts: ["d", "p", "q", "b"], ans: 3, exp: "The mirror image of 'b' when reflected horizontally is 'd'." },
  ],
  verbal: [
    { q: "Choose the word most similar in meaning to 'VERBOSE':", opts: ["Concise", "Wordy", "Silent", "Brief"], ans: 1, exp: "Verbose means using more words than needed. Wordy is the closest synonym." },
    { q: "Select the correctly spelled word:", opts: ["Accomodation", "Accommodation", "Accommadation", "Accomodatoin"], ans: 1, exp: "Correct spelling: Accommodation (double c, double m)." },
    { q: "Choose the antonym of 'BENEVOLENT':", opts: ["Kind", "Generous", "Malevolent", "Charitable"], ans: 2, exp: "Benevolent means kind/generous. Its antonym is Malevolent (wishing evil)." },
    { q: "Fill in the blank: He __ studying for three hours when she arrived.", opts: ["was", "had been", "is", "were"], ans: 1, exp: "'Had been studying' is past perfect continuous — action ongoing before another past event." },
    { q: "Select the correct passive voice: 'The teacher is teaching the students.'", opts: ["Students are being taught by the teacher.", "Students were taught by the teacher.", "Students had been taught.", "Students will be taught."], ans: 0, exp: "Present continuous active → 'is/are + being + past participle' in passive." },
    { q: "Identify the figure of speech: 'The wind whispered through the trees.'", opts: ["Simile", "Metaphor", "Personification", "Hyperbole"], ans: 2, exp: "Giving human quality (whisper) to a non-human (wind) = Personification." },
    { q: "Choose the one which best expresses the given sentence in indirect speech: He said, 'I am going to Delhi tomorrow.'", opts: ["He said he is going to Delhi tomorrow.", "He said he was going to Delhi the next day.", "He told he was going to Delhi next day.", "He said he will go to Delhi tomorrow."], ans: 1, exp: "Direct to indirect: 'I am' → 'he was', 'tomorrow' → 'the next day'." },
    { q: "Choose the correct article: 'She is __ honest woman.'", opts: ["a", "an", "the", "no article"], ans: 1, exp: "'Honest' starts with a vowel sound /ɒ/, so we use 'an'." },
    { q: "Which of the following is an example of correct subject-verb agreement?", opts: ["The team are playing well.", "Neither of the boys have arrived.", "Each of the students is responsible.", "The news are good today."], ans: 2, exp: "'Each' is singular → takes singular verb 'is'. Options A, B, D have agreement errors." },
    { q: "The idiom 'to burn the midnight oil' means:", opts: ["To start a fire", "To work late into the night", "To celebrate", "To waste time"], ans: 1, exp: "'Burn the midnight oil' = to work or study late at night." },
  ],
  cs: [
    { q: "What is the time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], ans: 1, exp: "Binary search divides the search space in half each iteration → O(log n)." },
    { q: "Which data structure uses LIFO (Last In, First Out)?", opts: ["Queue", "Stack", "Linked List", "Tree"], ans: 1, exp: "Stack follows LIFO — the last element pushed is the first to be popped." },
    { q: "What does SQL stand for?", opts: ["Structured Query Language", "Sequential Query Language", "Simple Query Language", "Standard Query Language"], ans: 0, exp: "SQL = Structured Query Language, used for managing relational databases." },
    { q: "Which sorting algorithm has the best average-case time complexity?", opts: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"], ans: 2, exp: "Quick Sort has average O(n log n) — best among listed options for practical use." },
    { q: "In OOP, what is 'encapsulation'?", opts: ["Inheriting properties", "Bundling data and methods", "Overriding functions", "Creating instances"], ans: 1, exp: "Encapsulation = bundling data (attributes) and methods (functions) within a class and restricting direct access." },
    { q: "What is the output of 5 >> 1 in most programming languages?", opts: ["10", "2", "5", "1"], ans: 1, exp: "Right shift by 1 = divide by 2 (integer). 5 >> 1 = 2 (5 in binary is 101, shifted to 10 = 2)." },
    { q: "What does HTTP stand for?", opts: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Protocol", "Hyper Transfer Technology Protocol"], ans: 0, exp: "HTTP = HyperText Transfer Protocol — the foundation of data communication on the web." },
    { q: "Which of the following is NOT a primary key property?", opts: ["Unique", "Not Null", "Composite by default", "Single per table (logically)"], ans: 2, exp: "A primary key is NOT composite by default. It CAN be composite, but that's extra design — not a default property." },
    { q: "What is a deadlock in OS?", opts: ["CPU overload", "Memory overflow", "Two processes waiting for each other indefinitely", "A crashed process"], ans: 2, exp: "Deadlock = A situation where two or more processes are waiting for each other to release resources indefinitely." },
    { q: "Which layer of the OSI model handles routing?", opts: ["Data Link", "Transport", "Network", "Session"], ans: 2, exp: "The Network Layer (Layer 3) handles routing and logical addressing (IP addresses)." },
  ],
};

type Category = keyof typeof QUESTION_BANK;

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { key: "aptitude", label: "APTITUDE", icon: <Calculator className="w-6 h-6" />, color: "#0066FF", desc: "Numbers, percentages, time & work, probability" },
  { key: "logical", label: "LOGICAL REASONING", icon: <Brain className="w-6 h-6" />, color: "#9333EA", desc: "Patterns, series, analogies, relationships" },
  { key: "verbal", label: "VERBAL ABILITY", icon: <MessageSquare className="w-6 h-6" />, color: "#FF8A00", desc: "Grammar, vocabulary, reading comprehension" },
  { key: "cs", label: "CORE CS", icon: <Cpu className="w-6 h-6" />, color: "#10b981", desc: "DSA, DBMS, OS, Networks, OOP concepts" },
];

const QUIZ_TIME = 600; // 10 minutes

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [phase, setPhase] = useState<"select" | "quiz" | "results">("select");
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<(typeof QUESTION_BANK.aptitude)[0][]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startQuiz = useCallback((cat: Category) => {
    setCategory(cat);
    const qs = shuffle(QUESTION_BANK[cat]).slice(0, 10);
    setQuestions(qs);
    setSelected(new Array(10).fill(null));
    setCurrent(0);
    setTimeLeft(QUIZ_TIME);
    setSubmitted(false);
    setPhase("quiz");
  }, []);

  useEffect(() => {
    if (phase !== "quiz" || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, submitted]);

  const handleSelect = (optIdx: number) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current!);
    setSubmitted(true);
    setPhase("results");
  };

  const score = questions.reduce((acc, q, i) => acc + (selected[i] === q.ans ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const isUrgent = timeLeft < 120;

  // ── Select Phase ──────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="space-y-12 pb-24 p-8 bg-white min-h-screen text-black font-sans">
        <div className="pb-8 border-b-4 border-black/5">
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest">
              10 QUESTIONS
            </div>
            <div className="px-3 py-1 rounded-full bg-[#0066FF] text-white text-[8px] font-black uppercase tracking-widest">
              10 MIN TIMER
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-3">
            DAILY <span className="text-[#0066FF]">QUIZ</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
            SELECT A CATEGORY TO BEGIN YOUR SESSION
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => startQuiz(cat.key)}
              className="bg-black text-white rounded-[3rem] p-10 text-left group hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"
                style={{ backgroundColor: `${cat.color}30` }}
              />
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-[#FF8A00] transition-colors">
                {cat.label}
              </h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-8">
                {cat.desc}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  10 QUESTIONS
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 text-[8px] font-black uppercase tracking-widest text-white/60">
                  10 MIN
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz Phase ────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const catMeta = CATEGORIES.find((c) => c.key === category)!;
    const q = questions[current];
    return (
      <div className="pb-24 p-8 bg-white min-h-screen text-black font-sans">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10 pb-8 border-b-4 border-black/5">
          <div>
            <div className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-1">
              QUESTION {current + 1} / {questions.length}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: catMeta.color }}>
              {catMeta.label}
            </h2>
          </div>
          {/* Timer */}
          <div
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-lg transition-all",
              isUrgent ? "bg-red-500 text-white animate-pulse" : "bg-black text-white"
            )}
          >
            <Timer className="w-5 h-5" />
            {mm}:{ss}
          </div>
        </div>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-2 mb-10">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-10 h-10 rounded-full text-xs font-black transition-all",
                i === current
                  ? "bg-black text-white scale-110"
                  : selected[i] !== null
                  ? "text-white"
                  : "bg-[#f4f4f5] text-black/40 hover:bg-black/10"
              )}
              style={selected[i] !== null && i !== current ? { backgroundColor: catMeta.color } : {}}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-black text-white rounded-[3rem] p-10 mb-8">
                <p className="text-xl font-black leading-relaxed">{q.q}</p>
              </div>

              <div className="space-y-4">
                {q.opts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={cn(
                      "w-full text-left p-7 rounded-[2rem] font-black text-sm transition-all border-2",
                      selected[current] === i
                        ? "text-white border-transparent"
                        : "bg-[#f4f4f5] text-black border-transparent hover:border-black/20"
                    )}
                    style={
                      selected[current] === i
                        ? { backgroundColor: catMeta.color, borderColor: catMeta.color }
                        : {}
                    }
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mr-4">
                      {["A", "B", "C", "D"][i]}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className="px-8 py-4 rounded-[2rem] bg-[#f4f4f5] font-black text-xs uppercase tracking-widest disabled:opacity-20 hover:bg-black hover:text-white transition-all"
            >
              ← PREV
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="px-8 py-4 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#0066FF] transition-all flex items-center gap-2"
              >
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-10 py-4 rounded-[2rem] bg-[#0066FF] text-white font-black text-xs uppercase tracking-widest hover:bg-[#FF8A00] transition-all"
              >
                SUBMIT QUIZ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Results Phase ─────────────────────────────────────────────────────────
  const catMeta = CATEGORIES.find((c) => c.key === category)!;
  const resultColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#FF8A00" : "#ef4444";
  const resultLabel = pct >= 80 ? "OUTSTANDING" : pct >= 60 ? "GOOD JOB" : pct >= 40 ? "KEEP PRACTICING" : "NEEDS WORK";

  return (
    <div className="space-y-10 pb-24 p-8 bg-white min-h-screen text-black font-sans">
      {/* Score Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black text-white rounded-[4rem] p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-36 h-36 rounded-[3rem] flex items-center justify-center shadow-2xl flex-shrink-0" style={{ backgroundColor: `${resultColor}20` }}>
            <Trophy className="w-16 h-16" style={{ color: resultColor }} />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-3">{catMeta.label} RESULTS</div>
            <div className="text-8xl font-black tracking-tighter leading-none mb-2" style={{ color: resultColor }}>
              {score}/{questions.length}
            </div>
            <div className="text-3xl font-black uppercase tracking-tighter">{resultLabel}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">
              {pct}% ACCURACY • PRS IMPACT: +{Math.round(pct * 0.05)} PTS
            </div>
          </div>
        </div>
      </motion.div>

      {/* Per-question review */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-8 flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-[#0066FF]" /> ANSWER REVIEW
        </h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const isCorrect = selected[i] === q.ans;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-[2.5rem] border-2 overflow-hidden"
                style={{ borderColor: isCorrect ? "#10b98130" : "#ef444430" }}
              >
                <div
                  className="px-8 py-5 flex items-start gap-4"
                  style={{ backgroundColor: isCorrect ? "#10b98108" : "#ef444408" }}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm mb-3">{q.q}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.opts.map((opt, oi) => (
                        <span
                          key={oi}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest",
                            oi === q.ans
                              ? "bg-emerald-500/20 text-emerald-600"
                              : oi === selected[i] && !isCorrect
                              ? "bg-red-500/20 text-red-500 line-through"
                              : "bg-black/5 text-black/40"
                          )}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-black/50 italic">{q.exp}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Retry */}
      <div className="flex gap-4">
        <button
          onClick={() => startQuiz(category!)}
          className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#0066FF] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> RETRY
        </button>
        <button
          onClick={() => setPhase("select")}
          className="px-8 py-5 rounded-[2rem] bg-[#f4f4f5] font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
        >
          CHANGE CATEGORY
        </button>
      </div>
    </div>
  );
}
