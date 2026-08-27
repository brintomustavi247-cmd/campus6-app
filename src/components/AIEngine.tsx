import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Swords, 
  Send, 
  Paperclip, 
  FileText, 
  X, 
  Eye, 
  Terminal, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen,
  Compass
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  file?: {
    name: string;
    type: string;
    size: string;
    dataUrl?: string;
  };
}

interface AIEngineProps {
  userEmail: string | null;
  hasAiAccess: boolean;
  academicCategory: string;
}

// Predefined formulas and materials based on academic subjects for pro-active helper panel
const ACADEMIC_SUGGESTIONS: Record<string, { materials: string[]; formulas: string[]; tips: string[] }> = {
  math: {
    materials: [
      "Aurobit Interactive Calculus Visualizer",
      "Spaced Recall Card Deck: Advanced Integrals",
      "Saber_Pro's Curated Trigonometric Problem Set"
    ],
    formulas: [
      "d/dx [sin(x)] = cos(x)",
      "∫ (1/x) dx = ln|x| + C",
      "Euler's Identity: e^(iπ) + 1 = 0",
      "Quadratic: x = [-b ± √(b² - 4ac)] / 2a"
    ],
    tips: [
      "Deconstruct complex integrals by substituting u-parts first.",
      "Draw the graph of the function to visually check limits.",
      "Solve at least 3 practice variations for each active recall chapter."
    ]
  },
  physics: {
    materials: [
      "Aurobit Quantum Particle Simulator v1.2",
      "Lector Slide Guide: Electrostatics in a Vacuum",
      "MIT OpenCourseWare Reference Notes: Mechanics"
    ],
    formulas: [
      "Schrödinger Eq: iħ ∂/∂t Ψ = ĤΨ",
      "Coulomb's Force: F = k * (q₁q₂)/r²",
      "Einstein Mass-Energy: E = mc²",
      "Maxwell-Ampere: ∮ B·dl = μ₀I_encl + μ₀ε₀ dΦ_E/dt"
    ],
    tips: [
      "Always draw a Free Body Diagram (FBD) before creating force equations.",
      "Track unit dimensions (dimensional analysis) to verify intermediate derivations.",
      "Relate abstract semiconductor variables to classic fluid model analogs."
    ]
  },
  chemistry: {
    materials: [
      "Aurobit IUPAC Hydrocarbon Naming Guide",
      "Organic Esterification Practice Sheets",
      "Active Scholar Periodicity Trend Maps"
    ],
    formulas: [
      "Arrhenius Equation: k = A e^(-Ea/RT)",
      "Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA])",
      "Ideal Gas Law: PV = nRT",
      "Nernst Potential: E = E° - (RT/nF) ln(Q)"
    ],
    tips: [
      "Identify the functional groups in organic chains first before declaring IUPAC names.",
      "Check balancing coefficients on stoichiometric equations before solving moles.",
      "Use custom mnemonics to memorize dynamic periodic trends effortlessly."
    ]
  },
  ict: {
    materials: [
      "Aurobit DFS/BFS Graph Maze Simulator",
      "Standard C Programming Cheat Sheets (Structures/Pointers)",
      "SQL DBMS Query Sandbox Playground"
    ],
    formulas: [
      "Time Complexity (Binary Tree Search): O(log N)",
      "Shannon's Channel Capacity: C = B log₂(1 + S/N)",
      "Boolean Logic DeMorgan: ¬(A ∧ B) ≡ ¬A ∨ ¬B"
    ],
    tips: [
      "Always trace dynamic pointers on scratchpad before compiling complex C scripts.",
      "Dry run recursive algorithms with a small tree size of N=3.",
      "Verify foreign key references first when debugging complex SQL relational queries."
    ]
  },
  general: {
    materials: [
      "Aurobit Master Active Recall Framework",
      "Spaced Repetition Schedule Guide v2",
      "High-Performance Student Habits Syllabus"
    ],
    formulas: [
      "Spaced Repetition Interval: I(n) = 2.5 * I(n-1)",
      "Pomodoro Efficiency: E = (Focus Mins / Total Mins) * 100"
    ],
    tips: [
      "Summarize complex sections in bullet points immediately after reading.",
      "Test yourself with mock questions before looking at the textbook answers.",
      "Align hard chapters with your high-energy biological chronotype hours."
    ]
  }
};

export default function AIEngine({ userEmail, hasAiAccess, academicCategory }: AIEngineProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: `### 🧠 Aurobit Academic AI Engine v2.5
Welcome to the high-performance study console! I am your server-side AI academic mentor. 

#### 🎯 High-Performance Mode: Active
- **Subject Specialization**: SSC, HSC, Admission, and BCS Syllabus.
- **Streaming Speed**: 100+ tokens/sec using our dynamic fast chunk-renderer.
- **Input Types**: Text prompts, study PDFs, slide notes, code files, and images.

How can I help you master your curriculum today? Let's build study guides, run calculations, or solve tough practice questions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<{
    name: string;
    type: string;
    size: string;
    base64Data: string;
    mimeType: string;
    dataUrl: string;
  } | null>(null);

  // Proactive suggestions active subject detection
  const [detectedSubject, setDetectedSubject] = useState<"math" | "physics" | "chemistry" | "ict" | "general">("general");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect subject based on user query keywords
  const detectSubject = (text: string) => {
    const s = text.toLowerCase();
    if (s.includes("math") || s.includes("calculus") || s.includes("integral") || s.includes("geometry") || s.includes("algebra") || s.includes("গণিত")) {
      return "math";
    }
    if (s.includes("physic") || s.includes("electrostatics") || s.includes("mechanics") || s.includes("vector") || s.includes("পদার্থ")) {
      return "physics";
    }
    if (s.includes("chem") || s.includes("organic") || s.includes("reaction") || s.includes("ester") || s.includes("acid") || s.includes("রসায়ন")) {
      return "chemistry";
    }
    if (s.includes("ict") || s.includes("code") || s.includes("c ") || s.includes("programming") || s.includes("database") || s.includes("html") || s.includes("তথ্য")) {
      return "ict";
    }
    return "general";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // Stop default text paste behavior
        const file = items[i].getAsFile();
        if (file) {
          setAttachedFile(file); // Update your state here
          // Generate preview URL
          const previewUrl = URL.createObjectURL(file);
          setImagePreview(previewUrl);
        }
        break; // Stop after finding the first image
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1];
      
      setActiveFile({
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        base64Data,
        mimeType: file.type,
        dataUrl,
      });

      // Autofocus detected subject based on file name
      setDetectedSubject(detectSubject(file.name));
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !activeFile && !attachedFile) return;

    if (!hasAiAccess) {
      alert("This account does not have Gemini Pro/Advanced permission verified.");
      return;
    }


    const userMsgText = input;
    
    let currentFile = activeFile;
    if (attachedFile) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(attachedFile);
      });
      currentFile = {
        name: attachedFile.name || "pasted_image.png",
        type: attachedFile.type,
        size: `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        base64Data: dataUrl.split(",")[1],
        mimeType: attachedFile.type,
        dataUrl
      };
    }

    const subj = detectSubject(userMsgText || currentFile?.name || "");
    setDetectedSubject(subj);


    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userMsgText || `Analyze uploaded file: ${currentFile?.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      file: currentFile ? {
        name: currentFile.name,
        type: currentFile.type,
        size: currentFile.size,
        dataUrl: currentFile.dataUrl
      } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setActiveFile(null);
    setAttachedFile(null);
    setImagePreview(null);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history,
          file: currentFile ? {
            data: currentFile.base64Data,
            mimeType: currentFile.mimeType,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Connection failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response body stream");
      }

      const decoder = new TextDecoder("utf-8");
      let partialText = "";
      const modelMessageId = `model-${Date.now()}`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: modelMessageId,
          role: "model",
          text: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);

      setLoading(false); // Disable core spinning wheel to render streamed text immediately

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                partialText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === modelMessageId ? { ...m, text: partialText } : m))
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {}
          }
        }
      }

      // Flush remainder
      if (buffer.trim().startsWith("data: ")) {
        try {
          const parsed = JSON.parse(buffer.trim().slice(6));
          if (parsed.text) {
            partialText += parsed.text;
            setMessages((prev) =>
              prev.map((m) => (m.id === modelMessageId ? { ...m, text: partialText } : m))
            );
          }
        } catch (e) {}
      }

    } catch (err: any) {
      console.warn("Warning: Fetch error in AIEngine", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `⚠️ **Aurobit AI System Error:** ${err.message || "Failed to reach backend engine. Please try again."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ACADEMIC_SUGGESTIONS[detectedSubject];

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] bg-bg text-left">
      
      {/* LEFT COMPANION: AI Streaming Chat Interface (8 Cols) */}
      <div className="flex-1 flex flex-col w-full h-full">
        {/* Console Header */}
        <div className="p-4 bg-[#181A2A] border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow">
              <Brain className="w-4.5 h-4.5 text-text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Aurobit AI Core Engine</h3>
                <span className="text-[8px] bg-slate-500/10 text-gold border border-slate-500/20 px-1 rounded font-mono font-bold uppercase animate-pulse">STREAMING ENABLED</span>
              </div>
              <p className="text-[10px] text-text-primary/40">Syllabus category: {academicCategory || "General Academic"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-primary/30 font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span>MODEL: GEMINI-3.5-FLASH</span>
          </div>
        </div>

        {/* Chat History Messages Stream */}
        <div className="flex-1 px-2 sm:px-6 py-4 overflow-y-auto space-y-4 bg-[#0A0B11]">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full max-w-[98%] ${
                  isUser ? "self-end items-end ml-auto text-right" : "self-start items-start text-left"
                }`}
              >
                <span className="text-[8px] text-text-primary/30 font-mono mb-1 uppercase tracking-widest">
                  {isUser ? "you / scholar" : "aurobit AI mentor"}
                </span>

                <div
                  className={`px-3 md:px-4 py-3 rounded-2xl relative shadow-md transition-all text-xs leading-relaxed w-full ${
                    isUser
                      ? "bg-[#6366F1] text-text-primary rounded-tr-none text-left"
                      : "bg-surface border border-white/5 text-text-primary/95 rounded-tl-none"
                  }`}
                >
                  {/* Uploaded File Icon inside msg bubble */}
                  {msg.file && (
                    <div className="mb-2.5 p-2 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2.5 text-[10px] font-bold text-text-muted">
                      <FileText className="w-4 h-4 text-gold shrink-0" />
                      <span className="truncate max-w-[200px]">{msg.file.name}</span>
                      <span className="text-text-primary/30">({msg.file.size})</span>
                    </div>
                  )}

                  <div className="markdown-body w-full text-left">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[8px] text-text-primary/20 font-mono mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {loading && (
            <div className="self-start flex flex-col w-full max-w-[98%] items-start text-left">
              <span className="text-[8px] text-text-primary/30 font-mono mb-1 uppercase tracking-widest">aurobit AI mentor</span>
              <div className="p-4 rounded-2xl rounded-tl-none bg-[#1C1E2F] border border-white/5 text-text-primary/60 flex items-center gap-2.5 text-xs">
                <Brain className="w-4 h-4 text-gold animate-pulse shrink-0" />
                <span className="font-medium">Formulating structured learning output</span>
                <div className="flex gap-1 items-center shrink-0">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Console Input Footer */}
        <div className="p-2 border-t border-gray-800 bg-surface shrink-0">
          {imagePreview && (
            <div className="relative mb-2">
              <img src={imagePreview} className="h-20 w-auto rounded-lg" alt="Pasted attachment" />
              <button
                onClick={() => {
                  setAttachedFile(null);
                  setImagePreview(null);
                }}
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-text-primary rounded-full p-1 text-xs cursor-pointer shadow-lg z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {activeFile && !imagePreview && (
            <div className="mb-3">
              <div className="px-3 py-2 rounded-xl bg-[#1A1C2E] border border-white/5 flex justify-between items-center text-xs w-max max-w-full">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-text-primary font-bold truncate max-w-[200px]">{activeFile.name}</span>
                </div>
                <button
                  onClick={() => setActiveFile(null)}
                  type="button"
                  className="text-gold hover:text-text-muted p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 ml-4"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="application/pdf,image/*,text/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-xl border transition cursor-pointer shrink-0 ${
                activeFile
                  ? "bg-[#6366F1] border-[#6366F1] text-text-primary"
                  : "bg-[#0E1017] border-white/5 text-text-primary/50 hover:text-text-primary"
              }`}
              title="Attach Lecture PDF, Homework Code, or Formulas"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={activeFile ? "Instruct AI on attached file context..." : "Query academic syllabus database..."}
              className="flex-grow bg-[#0E1017] text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-xl px-4 py-3 outline-none placeholder-white/20 resize-none min-h-[44px] max-h-[120px]"
              rows={Math.min(3, (input.match(/\n/g) || []).length + 1)}
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !activeFile && !attachedFile)}
              className="p-3 rounded-xl bg-[#6366F1] hover:bg-[#5053D4] text-text-primary disabled:bg-white/5 disabled:text-text-primary/20 transition cursor-pointer shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COMPANION: Dynamic Proactive Study Booster (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-5 h-full overflow-y-auto">
        
        {/* Topic Detection Dashboard Card */}
        <div className="p-5 border-b border-white/5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Swords className="w-5 h-5 text-gold animate-pulse" />
            <div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">🎯 Study Booster</h3>
              <p className="text-[10px] text-text-primary/40">Real-time keyword diagnostics</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-text-primary/40 block">Detected Focus Subject</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6366F1]/10 text-[#818CF8] border border-slate-500/20 font-mono text-xs font-black uppercase mt-1">
                {detectedSubject} Workspace
              </span>
            </div>

            <p className="text-xs text-text-primary/50 leading-relaxed">
              Based on your active study queries and files, Aurobit automatically extracts curriculum blueprints, mathematical formulas, and proactive guides below to speed up your learning loop.
            </p>
          </div>
        </div>

        {/* Dynamic Formulas & Rules Panel */}
        <div className="p-5 border-b border-white/5 flex-1 space-y-4 overflow-y-auto min-h-[250px]">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <BookOpen className="w-5 h-5 text-[#22C55E]" />
            <div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Syllabus Formulas</h3>
              <p className="text-[10px] text-text-primary/40">Reference memory deck</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.formulas.map((formula, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-[#0A0B11] border border-white/5 rounded-xl text-xs text-text-primary font-mono flex items-center justify-between hover:border-slate-500/30 transition-all group"
              >
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[8px] font-bold text-text-primary/30 uppercase tracking-widest block">Rule {idx + 1}</span>
                  <span className="font-semibold text-text-muted group-hover:text-text-primary transition-colors block select-all truncate">
                    {formula}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Study Materials & Active Recall Deck */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Compass className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Interactive Study Materials</h3>
              <p className="text-[10px] text-text-primary/40">Custom learning aids</p>
            </div>
          </div>

          <div className="space-y-2">
            {suggestions.materials.map((mat, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 shrink-0"></span>
                <span className="text-xs text-text-primary/70 hover:text-text-primary transition-all cursor-pointer font-medium leading-relaxed">
                  {mat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adaptive Study Tactics */}
        <div className="bg-surface rounded-xl border border-white/5 p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Award className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Proactive Learning Tips</h3>
              <p className="text-[10px] text-text-primary/40">Spaced recall & routines</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <span className="text-xs font-black text-gold font-mono">0{idx + 1}</span>
                <p className="text-xs text-text-primary/60 leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
