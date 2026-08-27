import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, X, Send, Paperclip, FileText, Brain, Eye, Trash2, Search, Menu, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { collection, query, where, getDocs, setDoc, doc, addDoc, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

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

export default function GeminiChatPanel({ userEmail, hasAiAccess }: { userEmail?: string, hasAiAccess?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am Aurobit AI. I can analyze your study materials, PDFs, and notes. What would you like to explore today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, size: string, dataUrl: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetchSessions();
  }, [auth.currentUser]);

  const fetchSessions = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(collection(db, `users/${auth.currentUser?.uid}/ai_sessions`), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || "Untitled Session",
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setChatSessions(sessions);
    } catch (err) {
      console.warn("Failed to fetch chat sessions:", err);
    }
  };

  const saveMessageToFirebase = async (msgs: Message[]) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        const title = msgs.length > 1 ? msgs[1].text.substring(0, 30) + "..." : "New Chat";
        const docRef = await addDoc(collection(db, `users/${auth.currentUser?.uid}/ai_sessions`), {
                    title,
          timestamp: serverTimestamp()
        });
        sessionId = docRef.id;
        setCurrentSessionId(sessionId);
        setChatSessions([{id: sessionId, title, timestamp: new Date()}, ...chatSessions]);
      }
      
      await setDoc(doc(db, `users/${auth.currentUser?.uid}/ai_sessions`, sessionId), {
                title: chatSessions.find(s => s.id === sessionId)?.title || "Chat",
        messages: msgs,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Failed to save chat:", err);
    }
  };

  const loadSession = async (sessionId: string) => {
    const user = auth.currentUser;
    if(!user) return;
    try {
      const snapshot = await getDocs(query(collection(db, `users/${auth.currentUser?.uid}/ai_sessions`), where("__name__", "==", sessionId)));
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{
            id: "welcome",
            role: "model",
            text: "Welcome back to your session.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }]);
        }
        setCurrentSessionId(sessionId);
        if(window.innerWidth < 768) setShowSidebar(false);
      }
    } catch (err) {
      console.warn("Failed to load session:", err);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([{
      id: "welcome",
      role: "model",
      text: "New AI session initialized. How can I assist you?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    if(window.innerWidth < 768) setShowSidebar(false);
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/ai_sessions`, sessionId));
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        createNewSession();
      }
    } catch(err) {
      console.warn(err);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all AI chat history?")) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, `users/${auth.currentUser?.uid}/ai_sessions`), where("userId", "==", auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/ai_sessions`, docSnap.id));
      }
      setChatSessions([]);
      createNewSession();
    } catch(err) {
      console.warn(err);
    }
  };

  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedFile({
              name: file.name || "pasted_image.png",
              type: file.type || 'unknown',
              size: (file.size / 1024).toFixed(1) + ' KB',
              dataUrl: event.target?.result as string
            });
            setShowAttachmentMenu(false);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          type: file.type || 'unknown',
          size: (file.size / 1024).toFixed(1) + ' KB',
          dataUrl: event.target?.result as string
        });
        setShowAttachmentMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || loading) return;
    const user = auth.currentUser;
    
    let textToSend = inputText;
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend || (selectedFile ? "Analyzed attached file" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      file: selectedFile ? { ...selectedFile } : undefined
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputText("");
    setSelectedFile(null);
    setLoading(true);

    try {
      saveMessageToFirebase(updatedMessages);

      const idToken = user ? await user.getIdToken() : "";
      
      const payload = {
        message: textToSend,
        history: messages.map(m => ({ role: m.role, text: m.text })),
        file: newUserMsg.file ? {
          name: newUserMsg.file.name,
          mimeType: newUserMsg.file.type,
          data: selectedFile?.dataUrl?.split(',')[1] // base64 string
        } : null
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken && { "Authorization": `Bearer ${idToken}` })
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("API Request Failed: " + res.statusText);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) throw new Error("No reader stream");

      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      
      setMessages(prev => [...prev, newModelMsg]);

      let fullText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value, { stream: true });
        
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  lastMsg.text = fullText;
                  return newMsgs;
                });
              } else if (data.error) {
                console.warn("Stream error:", data.error);
                fullText += "\n\n[Error: " + data.error + "]";
              }
            } catch (e) {
              console.warn("Error parsing chunk", e, dataStr);
            }
          }
        }
      }

      setMessages(prev => {
        saveMessageToFirebase(prev);
        return prev;
      });
      
    } catch (err: any) {
      console.warn("Warning: Fetch error in GeminiChatPanel", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `⚠️ **Error:** ${err.message || "Failed to reach server"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = chatSessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="absolute inset-0 flex h-full pointer-events-auto bg-bg">
      {/* Sidebar for Chat History */}
      <div className={`fixed md:relative z-20 h-full w-[280px] bg-surface border-r border-white/5 transform transition-transform duration-300 flex flex-col ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <button onClick={createNewSession} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-text-primary py-2 rounded-xl text-xs font-bold transition-colors border border-white/5">
            <Swords className="w-4 h-4" />
            New Chat
          </button>
          <button onClick={() => setShowSidebar(false)} className="ml-2 md:hidden text-text-primary/50 hover:text-text-primary p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E1017] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder-white/30 focus:outline-none focus:border-[#6366F1]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => loadSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-left transition-all ${currentSessionId === session.id ? "bg-[#6366F1]/10 border border-[#6366F1]/20" : "hover:bg-white/5 border border-transparent"}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? 'text-[#6366F1]' : 'text-text-primary/40'}`} />
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${currentSessionId === session.id ? "text-text-primary" : "text-text-primary/70"}`}>{session.title}</h4>
                  <p className="text-[9px] text-text-primary/40 mt-0.5">{session.timestamp?.toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-text-primary/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/5">
          <button onClick={clearAllHistory} className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 py-2 rounded-xl text-xs font-bold transition-colors">
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      
      <div 
        className="flex-1 flex flex-col h-full bg-[#0E1017] relative w-full"
        onTouchStart={(e) => setTouchStartX(e.targetTouches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const touchEndX = e.changedTouches[0].clientX;
          if (touchEndX - touchStartX > 75) {
            setShowSidebar(true);
          } else if (touchStartX - touchEndX > 75) {
            setShowSidebar(false);
          }
          setTouchStartX(null);
        }}
      >
        

        <div className="flex-1 overflow-y-auto px-1 sm:px-6 py-2 sm:py-4 space-y-4 sm:space-y-6">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full group animate-fadeIn`}>
                <div className={`flex gap-2 w-full max-w-full md:max-w-[95%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-white/10" : "bg-[#6366F1]/20 border border-[#6366F1]/30"}`}>
                    {msg.role === "user" ? (
                      <span className="text-xs font-bold text-text-primary">U</span>
                    ) : (
                      <Brain className="w-4 h-4 text-[#6366F1]" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary/40">{msg.role === "user" ? "You" : "Aurobit AI"}</span>
                      <span className="text-[10px] text-text-primary/20 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className={`relative px-3 md:px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm w-full ${
                      msg.role === "user" 
                        ? "bg-surface border border-white/5 text-text-primary/90 rounded-tr-sm" 
                        : "bg-transparent text-text-primary/90"
                    }`}>
                      {msg.file && (
                        <div className="mb-3 p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-[#6366F1]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">{msg.file.name}</p>
                            <p className="text-[10px] text-text-primary/50">{msg.file.size} • {msg.file.type.split('/')[1] || msg.file.type}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="markdown-body prose prose-invert max-w-none break-words w-full text-left">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start w-full animate-fadeIn">
                <div className="flex gap-2 w-full max-w-full md:max-w-[95%] flex-row">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-[#6366F1] animate-pulse" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex gap-1.5 items-center px-2 py-3">
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area Fixed at Bottom */}
        <div className="p-2 sm:p-4 bg-bg border-t border-white/5 shrink-0">
          <div className="max-w-4xl mx-auto w-full relative">
            
            {/* Selected File Preview above input */}
            {selectedFile && (
              <div className="absolute bottom-full mb-2 left-0 right-0 flex justify-center">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="relative inline-block animate-fadeIn shadow-2xl rounded-xl">
                    <img src={selectedFile.dataUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-[#6366F1]/30" />
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-text-primary rounded-full p-1.5 hover:bg-rose-400 cursor-pointer shadow-lg z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface border border-[#6366F1]/30 rounded-xl p-2 flex items-center gap-3 shadow-2xl animate-fadeIn w-max max-w-full">
                    <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <p className="text-[11px] font-bold text-text-primary truncate">{selectedFile.name}</p>
                      <p className="text-[9px] text-text-primary/50">{selectedFile.size}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedFile(null)} className="p-1.5 bg-black/40 hover:bg-rose-500/20 text-text-primary/50 hover:text-rose-400 rounded-lg transition-colors cursor-pointer shrink-0 ml-2">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-surface rounded-2xl border border-white/10 p-2 shadow-sm focus-within:border-[#6366F1]/50 focus-within:ring-1 focus-within:ring-[#6366F1]/50 transition-all">
              
              <div className="relative shrink-0">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-3 text-text-primary/40 hover:text-text-primary hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-3 text-text-primary/40 hover:text-text-primary hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {/* WhatsApp Style Attachment Menu */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-surface border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 w-48 animate-fadeIn z-50">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    {[
                      { icon: <FileText className="w-4 h-4 text-gold" />, label: "Document / PDF" },
                      { icon: <Eye className="w-4 h-4 text-gold" />, label: "Photo / Image" }
                    ].map((item, i) => (
                      <button key={i} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-text-primary/80 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                          {item.icon}
                        </div>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Aurobit AI or upload study material..."
                className="flex-1 bg-transparent border-none text-text-primary text-sm focus:outline-none resize-none max-h-48 py-3 min-h-[48px] placeholder-white/30"
                rows={Math.min(5, inputText.split('\n').length)}
              />

              <button
                onClick={handleSend}
                disabled={(!inputText.trim() && !selectedFile) || loading}
                className="p-3 bg-[#6366F1] hover:bg-[#5053D4] disabled:opacity-50 disabled:hover:bg-[#6366F1] text-text-primary rounded-xl transition-all cursor-pointer shadow-lg shrink-0 mb-0.5 mr-0.5"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="hidden sm:block text-center text-[10px] text-text-primary/30 font-mono mt-3">Aurobit AI can make mistakes. Consider verifying critical academic information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
