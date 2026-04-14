"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Video, 
  Play, 
  Square, 
  RefreshCcw, 
  Award, 
  MessageSquare, 
  ArrowRight,
  Loader2,
  Volume2,
  Settings2,
  User,
  Pause,
  Zap,
  Bot,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState("Moderate");
  const [companyType, setCompanyType] = useState("Product");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [question, setQuestion] = useState("Configure your session and click Initialize.");
  const [liveTranscription, setLiveTranscription] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [micBoost, setMicBoost] = useState(1);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [systemLogs, setSystemLogs] = useState<string[]>(["System initialized."]);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize webcam & Speech Recognition
  useEffect(() => {
    async function setupCamera() {
      try {
        addLog("Requesting Camera & Mic...");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(d => d.kind === 'audioinput');
        setAvailableDevices(audioDevices);
        
        const constraints = { 
            video: true, 
            audio: selectedMic ? { deviceId: { exact: selectedMic } } : true 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        
        // Rebuild VAD on stream change
        if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        addLog(`Device Connected: ${audioDevices.find(d => d.deviceId === selectedMic)?.label || "Default"}`);
        setMediaError(null);
      } catch (err: any) {
        addLog(`Hardware Error: ${err.name} - ${err.message}`);
        console.warn("Dual media failed, trying audio-only...", err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = audioStream;
          addLog("Microphone ONLY connected.");
          setMediaError(null);
        } catch (audioErr: any) {
          addLog("FAILED: No mic found.");
          setMediaError("No microphone found. Please connect a device.");
        }
      }
    }

    // Initialize WebkitSpeechRecognition for real-time UI text
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setLiveTranscription(currentText);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.warn("SpeechRecognition Error:", event.error);
        };

        recognitionRef.current.onend = () => {
          // If we're still recording, restart recognition
          if (isRecording && recognitionRef.current && !isPaused) {
            try { recognitionRef.current.start(); } catch(e) {}
          }
        };
      }
    }

    setupCamera();
  }, [selectedMic]);

  const resetMic = async () => {
    addLog("Hard Resetting Mic...");
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
    }
    window.location.reload();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis || isPaused) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // AUTOMATICALLY START LISTENING AFTER AI FINISHES
      if (!isPaused) {
        setTimeout(startRecording, 500); 
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {}

    setInterviewStarted(true);
    setQuestion("Checking AI System Heartbeat...");
    setIsProcessing(true);
    setProcessingStage("AI is waking up...");
    
    try {
      // Pre-warm the backend with a strict 4s timeout
      const statusController = new AbortController();
      const stid = setTimeout(() => statusController.abort(), 4000);
      
      const statusRes = await fetch("http://localhost:8000/status", { signal: statusController.signal }).catch(() => null);
      clearTimeout(stid);
      if (statusRes) {
        const statusData = await statusRes.json();
        if (statusData.ollama !== "ok") setQuestion("Ollama is starting up... please wait.");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      setQuestion("Activating AI Interviewer...");
      
      try {
        const response = await fetch("http://localhost:8000/welcome", { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        setQuestion(data.text);
        setIsProcessing(false);
        speak(data.text);
      } catch (err: any) {
        setIsProcessing(false);
        const fallback = "Hi! I am PlaceRight AI. Let's begin. Please tell me about yourself.";
        setQuestion(fallback);
        speak(fallback);
      }
    } catch (err) {
      setIsProcessing(false);
      setQuestion("System Ready. Please introduce yourself.");
    }
  };

  const startRecording = async () => {
    if (!streamRef.current || isProcessing || isSpeaking || isPaused) return;
    
    setIsRecording(true);
    setLiveTranscription(""); // Reset real-time text
    audioChunksRef.current = [];
    
    try {
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendToBackend(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      // Start Real-time Browser STT for UI
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }

      startVAD();
    } catch (err) {
      console.error("Recording error:", err);
      setIsRecording(false);
    }
  };

  const startVAD = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') return;

    try {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current!);
        source.connect(analyserRef.current);
        addLog("VAD Linked to Mic.");
    } catch (e) {
        addLog("VAD Link Failed.");
    }

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkSilence = () => {
      if (!isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const avg = (sum / bufferLength) * micBoost; // Apply boost
      setVolume(avg);

      // Log raw volume numbers periodically to diagnostic console
      if (avg > 1 && Math.random() > 0.95) {
          addLog(`Live Mic Input: ${avg.toFixed(1)}`);
      }

      if (avg < 18) { // More aggressive silence detection
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => stopRecording(), 1500); // Snappier 1.5s delay
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }

      if (isRecording) requestAnimationFrame(checkSilence);
    };

    requestAnimationFrame(checkSilence);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendToBackend = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    setProcessingStage("Transcribing your voice...");
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    formData.append("difficulty", difficulty);
    formData.append("company_type", companyType);

    try {
      const response = await fetch("http://localhost:8000/interview", {
        method: "POST",
        body: formData,
      });
      
      setProcessingStage("AI is thinking...");
      const data = await response.json();
      
      setSessionResults(data);
      setQuestion(data.next_question);
      setScores(prev => [...prev, parseInt(data.score) || 0]);
      setIsAnalyzing(false);
      
      // AUTO-SPEAK NEXT QUESTION
      speak(data.next_question);
    } catch (err) {
      setIsAnalyzing(false);
      setQuestion("Backend error. Please check your connection.");
    }
  };

  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col selection:bg-[#00FF85]/20 bg-[#050505] font-sans relative z-10 pointer-events-auto overflow-y-auto custom-scrollbar">
      
      {/* Dynamic Header / Studio Bar */}
      <div className="px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-[10000]">
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
           <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-[#00FF85] hover:bg-[#00FF85] hover:text-black transition-all group pointer-events-auto relative z-[1001] font-black"
           >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[11px] uppercase tracking-widest">BACK TO COMMAND CENTER</span>
           </button>

           <div className="w-px h-6 bg-white/10" />

           <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00FF85] flex items-center justify-center p-[2px]">
                  <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#00FF85]" />
                  </div>
              </div>
              <div>
                  <h1 className="text-lg font-black tracking-tight uppercase leading-none">AI Studio <span className="text-[#00FF85]">Pro</span></h1>
                  <p className="text-[7px] text-white/30 font-black tracking-[0.3em] uppercase mt-1">Dedicated Interview Environment</p>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">Global Readiness</span>
              <div className="flex items-center gap-2">
                 <div className="flex gap-[2px]">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("w-3 h-1 rounded-full", parseInt(String(averageScore)) >= i*2 ? "bg-[#00FF85]" : "bg-white/10")} />
                    ))}
                 </div>
                 <span className="text-sm font-black text-[#00FF85]">{averageScore}/10</span>
              </div>
           </div>

           {interviewStarted && (
            <button 
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                    "px-6 py-2.5 rounded-xl flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest border pointer-events-auto relative z-[1001]",
                    isPaused ? "bg-[#FF8A00] border-[#FF8A00] text-white shadow-[0_0_20px_rgba(255,138,0,0.3)]" : "bg-white/5 border-white/10 text-white hover:border-white/20"
                )}
            >
                {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                {isPaused ? "Resume" : "Pause Session"}
            </button>
           )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col min-h-0 border-r border-white/5 bg-[#080808]">
            {/* AI Question Section - MOVED TO TOP FOR BETTER VISIBILITY */}
            <div className="px-6 md:px-12 py-6 md:py-10 bg-gradient-to-b from-[#0066FF]/10 to-transparent">
                    <MessageSquare className="w-4 h-4 text-[#0066FF] fill-current" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Interviewer Prompt</span>
                <h2 className="text-xl md:text-4xl font-black leading-tight tracking-tight mb-4 animate-in fade-in duration-700 max-w-4xl text-white shadow-[#00FF85]/10 drop-shadow-2xl">
                    {question}
                </h2>
                {isProcessing && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-[#00FF85] tracking-widest animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {processingStage || "Synchronizing AI..."}
                    </div>
                )}
            </div>

            {/* Video Viewport */}
            <div className="px-4 md:px-8 pb-8 md:pb-12 relative group pointer-events-none">
                <div className={cn(
                    "w-full aspect-video rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 relative bg-black shadow-2xl pointer-events-auto max-w-5xl mx-auto",
                    isRecording ? "border-[#00FF85] shadow-[0_0_60px_rgba(0,255,133,0.15)] scale-[0.99]" : "border-white/10"
                )}>
                    <video ref={videoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover transition-opacity duration-1000", isRecording ? "opacity-100" : "opacity-60")} />
                    
                    {/* Listening Indicators - FLOATING MINIMALIST */}
                    {isRecording && (
                        <>
                            <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-[#00FF85]/30 px-5 py-2.5 rounded-2xl z-20">
                                <div className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF85]">Listening...</span>
                            </div>

                            <div className="absolute top-8 right-8 z-20 flex gap-1 items-end h-6 px-4 bg-black/40 rounded-xl backdrop-blur-sm border border-white/5">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div 
                                        key={i} 
                                        className="w-1 bg-[#00FF85] rounded-full transition-all duration-75" 
                                        style={{ height: `${Math.min(100, Math.max(15, (volume * (2 + i % 2))))}%` }} 
                                    />
                                ))}
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            
                            <div className="absolute inset-x-0 bottom-12 px-12 z-20 flex flex-col items-center gap-8">
                                <p className="text-xl md:text-2xl font-black text-center text-white/90 drop-shadow-2xl line-clamp-2 max-w-2xl px-8 border-l-4 border-[#00FF85]">
                                    {liveTranscription || "I'm capturing every word..."}
                                </p>
                                
                                <button 
                                    onClick={stopRecording}
                                    className="bg-white hover:bg-[#00FF85] text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl transition-all active:scale-95 group"
                                >
                                    <Square className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                    End Response
                                </button>
                            </div>
                        </>
                    )}

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[50]">
                        <div className="flex flex-col items-center gap-8 translate-y-[-20%]">
                          <div className="relative w-40 h-40">
                             <div className="absolute inset-0 border-[12px] border-white/5 rounded-full" />
                             <div className="absolute inset-0 border-[12px] border-[#00FF85] border-t-transparent rounded-full animate-spin [animation-duration:0.8s]" />
                             <Zap className="absolute inset-0 m-auto w-16 h-16 text-[#00FF85] animate-pulse" />
                          </div>
                          <div className="text-center">
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-3 italic">AI Analysis</h2>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-ping" />
                                <span className="font-black uppercase tracking-[0.5em] text-[12px] text-[#00FF85]">
                                    {processingStage || "Crunching technical insights"}
                                </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSpeaking && !isRecording && (
                        <div className="absolute bottom-10 inset-x-0 flex justify-center z-10 pointer-events-none">
                            <div className="bg-[#0066FF] text-white px-8 py-3 rounded-2xl flex items-center gap-4 font-black uppercase text-[10px] tracking-widest shadow-[0_0_50px_rgba(0,102,255,0.4)] border border-[#0066FF] animate-bounce pointer-events-auto">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                                AI Speaker Active
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hardware Controls - SLIM DOCK */}
            <div className="px-4 md:px-8 pb-6 md:pb-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 bg-black/60 backdrop-blur-3xl sticky bottom-0 z-[50]">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/40 px-1">Selected Input</span>
                        <select 
                            value={selectedMic} 
                            onChange={(e) => setSelectedMic(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[9px] font-bold outline-none text-[#00FF85] w-48"
                        >
                            {availableDevices.map(d => (
                                <option key={d.deviceId} value={d.deviceId} className="bg-black text-white">{d.label || `Microphone ${d.deviceId.slice(0,5)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/40 px-1">Sensitivity</span>
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <input 
                                type="range" min="1" max="10" step="0.5" 
                                value={micBoost} onChange={(e) => setMicBoost(parseFloat(e.target.value))}
                                className="w-20 accent-[#00FF85]"
                            />
                            <span className="text-[9px] font-bold text-[#00FF85]">{micBoost}x</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col gap-1 max-w-xs overflow-hidden">
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40 px-1 text-right">System Logs</span>
                    <p className="text-[8px] font-mono text-[#00FF85]/60 truncate italic">{systemLogs[systemLogs.length-1]}</p>
                </div>

                <button 
                    onClick={resetMic}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-90"
                    title="Hard Reset Camera & Mic"
                >
                    <RefreshCcw className="w-4 h-4 text-white/60" />
                </button>
            </div>
        </div>

        {/* Right Sidebar: Real-Time Analysis */}
        <div className="lg:col-span-4 flex flex-col bg-black/40 backdrop-blur-md p-6 md:p-8 gap-8 border-l border-white/5">
            <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#00FF85]">Analysis Hub</h2>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] border-b border-white/10 pb-4">Live Technical Breakdown</p>
            </div>

            <div className="space-y-6">
                {sessionResults?.transcription && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-[#00FF85]/30" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00FF85]">Your Response</span>
                         </div>
                         <div className="bg-white/5 p-6 rounded-[2rem] border-l-4 border-[#00FF85] relative overflow-hidden">
                            <p className="text-sm font-medium leading-relaxed italic text-white/90 relative z-10">"{sessionResults.transcription}"</p>
                            <div className="absolute top-0 right-0 w-24 h-full bg-[#00FF85]/5 -skew-x-12 translate-x-12" />
                         </div>
                    </div>
                )}

                {sessionResults && (
                   <div className="space-y-6 animate-in fade-in duration-700 delay-300">
                        {/* Score Card */}
                        <div className="bg-gradient-to-br from-white/10 to-transparent p-6 rounded-[2rem] border border-white/10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Session Score</h3>
                                    <p className="text-3xl font-black text-[#00FF85] italic">{sessionResults.score}<span className="text-sm opacity-30 not-italic ml-1">/10</span></p>
                                </div>
                                <Award className="w-8 h-8 text-[#00FF85] opacity-20" />
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.5)] transition-all duration-1000" style={{ width: `${(sessionResults.score || 0) * 10}%` }} />
                            </div>
                        </div>

                        {/* Feedback Card */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[1px] bg-[#0066FF]/30" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0066FF]">Technical Feedback</span>
                            </div>
                             <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/20 group hover:border-[#00FF85]/40 transition-all shadow-2xl">
                                <p className="text-base font-bold leading-relaxed text-white selection:bg-[#00FF85]/30">{sessionResults.feedback}</p>
                            </div>
                        </div>

                        {/* Stats Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/10 shadow-lg">
                                <span className="text-[8px] font-black uppercase text-white/50 block mb-1">Fluency</span>
                                <span className="text-[11px] font-black text-[#00FF85] uppercase tracking-widest">{sessionResults.confidence || "Good"}</span>
                            </div>
                            <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/10 shadow-lg">
                                <span className="text-[8px] font-black uppercase text-white/50 block mb-1">Company Fit</span>
                                <span className="text-[11px] font-black text-[#00FF85] uppercase tracking-widest">{companyType}</span>
                            </div>
                        </div>
                   </div>
                )}
            </div>
        </div>
      </div>
      {/* GLOBAL OVERLAYS - HIGHEST Z-INDEX */}
      {!interviewStarted && (
          <div className="fixed inset-0 bg-[#050505] flex items-center justify-center p-6 md:p-12 text-center z-[20000] pointer-events-auto overflow-y-auto">
                <div className="flex flex-col items-center max-w-2xl animate-in zoom-in-95 duration-700 py-20 md:py-0">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#0066FF] to-[#00FF85] p-[3px] md:p-[4px] mb-6 md:mb-10 shadow-[0_0_80px_rgba(0,102,255,0.3)]">
                        <div className="w-full h-full rounded-[1.3rem] md:rounded-[2.3rem] bg-black flex items-center justify-center">
                            <Bot className="w-6 h-6 md:w-10 md:h-10 text-[#00FF85]" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-4 md:mb-6 italic">Prepare for <span className="text-[#00FF85]">Success</span></h2>
                    <p className="text-white/40 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] mb-8 md:mb-16 px-4 md:px-10 leading-loose">
                        Synchronizing with your technical stack. Select environment difficulty to begin.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-12 md:mb-16 w-full md:w-auto px-10 md:px-0">
                        {[
                            { id: "Easy", label: "CTS (Easy)" }, 
                            { id: "Moderate", label: "Product (Medium)" }, 
                            { id: "Hard", label: "Zoho (Advanced)" }
                        ].map((d) => (
                        <button key={d.id} onClick={() => setDifficulty(d.id)} className={cn("px-8 md:px-12 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] transition-all border cursor-pointer active:scale-90", difficulty === d.id ? "bg-[#00FF85] border-[#00FF85] text-black shadow-[0_0_40px_rgba(0,255,133,0.4)] scale-105 md:scale-110" : "bg-white/5 border-white/10 text-white/40 hover:text-white/80")}>{d.label}</button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            addLog("Starting Session...");
                            startInterview();
                        }} 
                        className="bg-white text-black hover:bg-[#00FF85] hover:scale-105 px-12 md:px-24 py-5 md:py-8 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-xs md:text-sm transition-all flex items-center gap-4 md:gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] active:scale-95 group"
                    >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current group-hover:rotate-12 transition-transform" />
                        Enter Simulation
                    </button>
                    
                    <div className="hidden md:flex mt-20 gap-8 opacity-20 group hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00FF85]" /> <span className="text-[8px] font-black uppercase tracking-widest">Mic Ready</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00FF85]" /> <span className="text-[8px] font-black uppercase tracking-widest">Cam Ready</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00FF85]" /> <span className="text-[8px] font-black uppercase tracking-widest">AI Core Live</span></div>
                    </div>
                </div>
          </div>
      )}
    </div>
  );
}
