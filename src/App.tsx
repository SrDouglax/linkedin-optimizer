import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Award, ChevronRight, Info, Loader2, MessageSquare, Send, Shield, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeminiService } from './services/gemini';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const gemini = React.useMemo(() => new GeminiService(apiKey), [apiKey]);

  // Reactive URL detection
  useEffect(() => {
    if (inputValue.includes('linkedin.com/in/') && inputValue.length < 150) {
      setShowHelper(true);
    } else if (inputValue.length > 200 || inputValue.length === 0) {
      setShowHelper(false);
    }
  }, [inputValue]);

  const handleAnalyze = async () => {
    if (!apiKey || !inputValue) return;

    // Safety check again
    if (inputValue.includes('linkedin.com/in/') && inputValue.length < 150) {
      setShowHelper(true);
      return;
    }

    setIsAnalyzing(true);
    localStorage.setItem('gemini_api_key', apiKey);
    try {
      const data = await gemini.analyzeProfile(inputValue);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analysis error. Please ensure you pasted the profile content.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message || !result) return;
    const currentMsg = message;
    setChatHistory(prev => [...prev, { role: 'user', text: currentMsg }]);
    setMessage('');
    setIsChatting(true);
    try {
      const chat = await gemini.startChat(inputValue, chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })));
      const res = await chat.sendMessage(currentMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: res.response.text() }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-cyan-500/30">
      <div className="premium-bg" />

      <header className="max-w-6xl mx-auto pt-16 pb-12 px-6 flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 glass mb-6">
          <Shield className="w-8 h-8 text-cyan-400" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black font-outfit text-center mb-2 tracking-tight">
          <span className="text-white">LinkedIn</span>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent"> Optimizer</span>
        </h1>
        <p className="text-slate-400 font-light text-center">Elite professional analysis in seconds.</p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        {!result ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 font-outfit">Google Gemini API Key</label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] text-cyan-400 hover:underline">Get Free Key →</a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="input-field !py-3 !text-sm"
                placeholder="Insert your API Key..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 font-outfit">
                <User size={14} className="text-violet-400" /> Profile Content
              </label>
              <textarea
                rows={6}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="input-field resize-none leading-relaxed"
                placeholder="Just copy and paste your profile content here..."
              />
            </div>

            <AnimatePresence>
              {showHelper && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 overflow-hidden"
                >
                  <Info className="shrink-0 text-amber-400 mt-1" size={20} />
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white uppercase tracking-tight">Access Guide</p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      LinkedIn protects private data. To get an elite analysis, please follow these steps:
                    </p>
                    <div className="space-y-3">
                      {[
                        { step: 1, text: "Open your LinkedIn Profile in a new tab" },
                        { step: 2, text: "Click \"Show all\" on all collapsed sections (Experience, About, etc.)" },
                        { step: 3, text: "Press CTRL+A then CTRL+C to copy everything" },
                        { step: 4, text: "Paste the content into the box above" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3 group">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-400 group-hover:bg-orange-500/30 transition-colors">
                            {item.step}
                          </span>
                          <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleAnalyze} disabled={isAnalyzing || !apiKey || !inputValue} className="btn-primary w-full group py-4">
              <div className="flex items-center justify-center gap-3 text-lg font-outfit tracking-wide">
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {isAnalyzing ? "Processing Strategy..." : "Generate Analysis Report"}
              </div>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center p-1 bg-white/[0.03] border border-white/10 rounded-2xl w-fit mx-auto backdrop-blur-md">
              <button onClick={() => setActiveTab('analysis')} className={`px-8 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${activeTab === 'analysis' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                <Award size={18} /> Market Analysis
              </button>
              <button onClick={() => setActiveTab('chat')} className={`px-8 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${activeTab === 'chat' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                <MessageSquare size={18} /> Career Coach
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'analysis' ? (
                <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-5 glass p-10 flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                        <motion.circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-cyan-400 shadow-cyan-500" strokeDasharray={552} initial={{ strokeDashoffset: 552 }} animate={{ strokeDashoffset: 552 - (552 * result.score) / 100 }} transition={{ duration: 2 }} strokeLinecap="round" />
                      </svg>

                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black font-outfit text-white">{result.score}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Strength</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-2xl mb-3 text-white">Profile Verdict</h3>
                    <p className="text-sm text-slate-400 leading-relaxed italic border-t border-white/5 pt-4">"{result.summary}"</p>
                  </div>

                  <div className="md:col-span-7 space-y-6">
                    <div className="glass p-8 border-l-4 border-emerald-500/50">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2 font-outfit"><Award size={16} /> Key Strengths</h4>
                      <ul className="space-y-4">
                        {result.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-3"><ChevronRight size={18} className="text-emerald-500/50 shrink-0 mt-0.5" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass p-8 border-l-4 border-amber-500/50">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2 font-outfit"><AlertCircle size={16} /> Growth Opportunities</h4>
                      <ul className="space-y-4">
                        {result.weaknesses.map((w: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-3"><ChevronRight size={18} className="text-amber-500/50 shrink-0 mt-0.5" /> {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass flex flex-col h-[650px] overflow-hidden">
                  <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30"><Sparkles size={20} className="text-violet-400" /></div>
                      <div>
                        <span className="text-sm font-bold text-white block">Coach AI Advisor</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 uppercase font-bold tracking-widest">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Active Session
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-4 opacity-40">
                        <MessageSquare size={48} className="text-slate-600 mb-2" />
                        <p className="text-sm">Ask me to rewrite your "About" section or suggest skills based on your goals.</p>
                      </div>
                    )}
                    {chatHistory.map((msg: any, i: number) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-violet-600/20 border border-violet-500/30 shadow-lg' : 'bg-white/[0.05] border border-white/10'}`}>
                          <div className="prose prose-invert prose-sm"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex justify-start">
                        <div className="bg-white/[0.03] p-4 rounded-2xl flex items-center gap-3 text-xs text-slate-500">
                          <Loader2 size={16} className="animate-spin" />
                          Advisor is typing...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-white/10 bg-white/[0.01]">
                    <div className="flex gap-3">
                      <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="input-field !py-3 !text-sm" placeholder="Ask for career advice or rewrites..." />
                      <button onClick={handleSendMessage} disabled={isChatting || !message} className="btn-primary !p-0 w-12 h-12 flex items-center justify-center shrink-0"><Send size={20} /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <center><button onClick={() => setResult(null)} className="text-[10px] text-slate-600 underline-offset-4 uppercase font-bold tracking-widest hover:text-slate-400 transition-colors">← Start New Analysis</button></center>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto py-12 text-center border-t border-white/5">
        <p className="text-[10px] uppercase font-bold text-slate-700 tracking-[0.2em]">LinkedIn Optimizer AI &copy; 2026 • Powered by Gemini 3 Flash</p>
      </footer>
    </div>
  );
}
