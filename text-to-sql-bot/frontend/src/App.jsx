import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Layers, Zap, Hexagon, Component, LayoutPanelLeft,
  TerminalSquare, Activity, ArrowRight, ShieldCheck, 
  CloudLightning, Database, Code2, Send, User, Bot, Loader2, Table2, Key, BarChart3,
  ChevronRight, CheckCircle2, Command
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* =========================================
   ROUTING LAYER
   ========================================= */
export default function App() {
  const [isAppLaunched, setIsAppLaunched] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!isAppLaunched ? (
        <motion.div key="landing" exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}>
          <LandingPage onLaunch={() => setIsAppLaunched(true)} />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <ChatApp onBack={() => setIsAppLaunched(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================
   PART 1: THE ENTERPRISE TEXT-TO-SQL APP
   ========================================= */
 function ChatApp({ onBack }) {
  const [activeTab, setActiveTab] = useState('workbench');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'workbench' && scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const userMsg = question;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setQuestion('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'API request failed');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.answer,
        query: data.query_executed,
        result: data.structured_data,
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'error', content: `Execution Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicChart = (data) => {
    if (!Array.isArray(data) || data.length === 0) return null;
    const keys = Object.keys(data[0]);
    let xAxisKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
    let yAxisKey = keys.find(k => typeof data[0][k] === 'number');
    if (!yAxisKey) return null; 

    return (
      <div className="w-full h-64 mt-6 bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="text-sm font-semibold text-white/90 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-300" /> Auto-Generated Visual
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#050505', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }}/>
            <Area type="monotone" dataKey={yAxisKey} stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorY)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden relative font-sans text-white antialiased">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[140px] mix-blend-screen opacity-50"></div>
      </div>

      <aside className="w-[280px] bg-black/40 border-r border-white/10 hidden md:flex flex-col relative z-20 backdrop-blur-3xl shadow-2xl">
        <div className="h-24 flex items-center px-8 border-b border-white/10">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={onBack}>
             <Hexagon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
             <span className="font-bold text-white text-lg tracking-tight">Nexus.</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-10 px-6 space-y-6">
           <div>
             <div className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4 pl-2">Workspace</div>
             <div className="space-y-2">
               <button onClick={() => setActiveTab('workbench')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'workbench' ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                 <Sparkles className={`w-4 h-4 ${activeTab === 'workbench' ? 'text-cyan-400' : ''}`} /> Copilot
               </button>
               <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'catalog' ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                 <LayoutPanelLeft className={`w-4 h-4 ${activeTab === 'catalog' ? 'text-amber-400' : ''}`} /> Schema
               </button>
             </div>
           </div>

           <div className="pt-6 border-t border-white/5">
             <button onClick={onBack} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all group">
               <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition" /> Back to Home
             </button>
           </div>
        </div>

        <div className="p-6">
           <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10">
             <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Status</div>
             <div className="text-xs text-white/60 font-medium leading-relaxed">System Live • OpenAI v4</div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 transition-all overflow-hidden bg-transparent">
        {activeTab === 'workbench' ? (
          <div className="flex flex-col w-full h-full relative">
            <div className="flex-1 overflow-y-auto px-6 md:px-20 pt-16 pb-48 no-scrollbar scroll-smooth">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter leading-tight italic">Knowledge. Unlocked.</h1>
                  <p className="text-white/40 text-lg mb-12 font-medium leading-relaxed">The engine is primed. Ask for insights, visualizations, or complex SQL breakdown in plain English.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                     {["Top spending users by country", "Sales trend over monthly axis"].map((s, i) => (
                       <button key={i} onClick={() => setQuestion(s)} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-left flex items-center justify-between group">
                         {s} <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition" />
                       </button>
                     ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-12 max-w-5xl mx-auto">
                {messages.map((msg, idx) => (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex gap-6 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                     {msg.role !== 'user' && (
                       <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border ${msg.role === 'error' ? 'bg-red-500/20 border-red-500/30' : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-white/20'}`}>
                         {msg.role === 'error' ? <Activity className="w-5 h-5 text-red-400" /> : <Bot className="w-6 h-6 text-cyan-400" />}
                       </div>
                     )}
                     
                     <div className={`w-full max-w-3xl p-8 rounded-3xl backdrop-blur-3xl border border-white/10 ${msg.role === 'user' ? 'bg-white/5 border-white/20 text-right' : 'bg-black/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]'}`}>
                       <div className={`text-[17px] font-medium leading-relaxed mb-4 ${msg.role === 'user' ? 'text-white' : 'text-white/80'}`}>{msg.content}</div>
                       {msg.query && msg.query !== "Agent executed internal dynamic queries." && (
                         <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden mb-4">
                           <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between text-[11px] font-bold text-white/30 uppercase tracking-widest">
                             <span>Generated SQL</span>
                             <div className="w-2 h-2 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                           </div>
                           <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '13px' }}>{msg.query}</SyntaxHighlighter>
                         </div>
                       )}
                       {msg.result && Array.isArray(msg.result) && renderDynamicChart(msg.result)}
                       {msg.result && (
                         <pre className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-cyan-200/50 font-mono text-xs overflow-x-auto selection:bg-cyan-500/20">{JSON.stringify(msg.result, null, 2)}</pre>
                       )}
                     </div>

                     {msg.role === 'user' && (
                       <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                         <User className="w-5 h-5 text-indigo-400" />
                       </div>
                     )}
                  </motion.div>
                ))}
              </div>
              {loading && <div className="text-white/30 text-xs font-bold py-12 text-center flex items-center justify-center gap-3"><Loader2 className="w-4 h-4 animate-spin text-cyan-500"/> THINKING...</div>}
              <div ref={scrollRef} />
            </div>
            
            <div className="absolute bottom-0 w-full px-6 md:px-20 pb-10 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-32 z-20 flex justify-center">
              <form onSubmit={handleSubmit} className="w-full max-w-5xl flex items-center bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-3xl p-1.5 shadow-2xl group focus-within:border-white/40 transition-all duration-500">
                <input type="text" className="w-full bg-transparent text-white text-[16px] p-4 pl-6 outline-none placeholder:text-white/20 font-medium" placeholder="Analyze your datasets..." value={question} onChange={e=>setQuestion(e.target.value)} disabled={loading} autoFocus/>
                <button type="submit" disabled={loading} className="p-4 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg"><Send className="w-5 h-5" /></button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-20 text-white max-w-5xl mx-auto relative z-10"><h2 className="text-4xl font-bold italic tracking-tighter">Schema Discovery.</h2><div className="mt-10 h-px w-20 bg-cyan-500 mb-10"></div><p className="text-white/40 text-lg font-medium">Currently indexed tables: [users, sales, inventories, logs].</p></div>
        )}
      </main>
    </div>
  );
}

/* =========================================
   PART 2: THE LANDING PAGE
   ========================================= */
const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    gsap.ticker.add((time)=>lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.remove(lenis.raf); };
  }, []);
  return <>{children}</>;
};

const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    setPosition({ x: (clientX - (left + width / 2)) * 0.2, y: (clientY - (top + height / 2)) * 0.2 });
  };

  return (
    <motion.button onClick={onClick} ref={ref} onMouseMove={handleMouse} onMouseLeave={() => setPosition({x:0,y:0})} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150 }} className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-[20px] opacity-0 group-hover:opacity-60 transition duration-500"></div>
      <div className="relative z-10 flex items-center justify-center bg-white text-black font-bold rounded-full w-full h-full border border-white/20 transition hover:bg-transparent hover:text-white backdrop-blur-md">
        {children}
      </div>
    </motion.button>
  );
};

const TiltGlowCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotate({ x: ((y - rect.height/2) / rect.height/2) * -5, y: ((x - rect.width/2) / rect.width/2) * 5 });
    setGlowPos({ x, y });
  };

  return (
    <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => setRotate({x:0,y:0})} animate={{ rotateX: rotate.x, rotateY: rotate.y }} style={{ perspective: 1000, transformStyle: "preserve-3d" }} className={`relative rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-[40px] overflow-hidden group transition-shadow ${className}`}>
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-screen" style={{ background: `radial-gradient(600px circle at ${glowPos.x}px ${glowPos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)` }} />
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
};

const GlowingButton = ({ children, onClick, className="" }) => (
  <button onClick={onClick} className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
    <div className="relative px-8 py-4 bg-[#050505] rounded-full leading-none flex items-center justify-center gap-2">
      <span className="text-white font-semibold">{children}</span>
    </div>
  </button>
);

function LandingPage({ onLaunch }) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30 font-sans text-white relative flex flex-col">
        
        {/* Background Grid & Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-white opacity-40"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[140px] mix-blend-screen"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/15 rounded-full blur-[140px] mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[140px] mix-blend-screen"></div>
        </div>

        {/* Header */}
        <nav className="fixed top-0 w-full z-50 bg-[#050505]/50 backdrop-blur-xl border-b border-white/[0.05] py-4 transition-all">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Hexagon className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"/> 
              <span className="font-bold text-white text-xl tracking-tight">Nexus.</span>
            </div>
            <div className="hidden md:flex gap-8 items-center text-sm font-medium text-white/60">
              <span className="hover:text-white cursor-pointer transition">Features</span>
              <span className="hover:text-white cursor-pointer transition">Workflow</span>
              <span className="hover:text-white cursor-pointer transition">Engine</span>
            </div>
            <button onClick={onLaunch} className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">Open Sandbox</button>
          </div>
        </nav>

        <main className="flex-1 w-full flex flex-col">
          {/* Hero */}
          <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6 z-10 w-full">
            <motion.div style={{ y: y1, opacity }} className="max-w-5xl mx-auto flex flex-col items-center text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-cyan-300 uppercase tracking-widest mb-8 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Data Platform
              </motion.div>
              <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
                Query your data with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">pure logic.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl md:text-2xl text-white/50 mb-12 font-medium max-w-3xl leading-relaxed">
                Transform human language into optimized SQL instantly. Build, query, and visualize at the speed of thought.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex gap-6 items-center">
                <GlowingButton onClick={onLaunch}>
                   Launch Space <ArrowRight className="w-5 h-5"/>
                </GlowingButton>
                <button className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition group">
                   <Command className="w-5 h-5 group-hover:text-cyan-400 transition" /> View Documentation
                </button>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Bento */}
          <section className="relative py-32 px-6 z-10 w-full bg-black/20">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Built for intelligence.</h2>
                <p className="text-xl text-white/50 mt-4 max-w-2xl">A masterful integration of LLMs and robust data routing architectures.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
                
                <TiltGlowCard className="md:col-span-2 md:row-span-2 p-12 flex flex-col justify-between group">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                      <Database className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4">Autonomous Execution</h3>
                    <p className="text-white/50 text-xl max-w-md leading-relaxed">Agentic SQL layer continuously validates, self-corrects, and executes queries before responding to the user.</p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-[60%] h-[60%] opacity-20 pointer-events-none blur-[2px] group-hover:blur-none transition-all duration-700 delay-100 translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0">
                     <div className="w-full h-full border-t border-l border-white/20 rounded-tl-3xl bg-white/5 flex p-6 gap-4">
                       <div className="w-32 h-8 bg-white/20 rounded-lg animate-pulse"></div>
                       <div className="w-24 h-8 bg-purple-500/40 rounded-lg animate-pulse delay-150"></div>
                     </div>
                  </div>
                </TiltGlowCard>

                <TiltGlowCard className="p-8 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-white/10 flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6 text-blue-400"/></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Zero-Trust Querying</h3>
                    <p className="text-white/50 font-medium leading-relaxed">Read-only connection protocols to protect your enterprise DB layer securely.</p>
                  </div>
                </TiltGlowCard>

                <TiltGlowCard className="p-8 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-white/10 flex items-center justify-center mb-4"><BarChart3 className="w-6 h-6 text-cyan-400"/></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Reactive Charts</h3>
                    <p className="text-white/50 font-medium leading-relaxed">Dynamic data mapping instantiates Recharts instantly upon numeric discovery.</p>
                  </div>
                </TiltGlowCard>

              </div>
            </div>
          </section>

          {/* Interactive Step / Preview */}
          <section className="relative py-32 px-6 z-10 border-t border-white/[0.05] bg-gradient-to-b from-transparent to-black w-full">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
              <div className="w-full lg:w-1/2 space-y-12">
                 <div>
                   <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Workflow in Motion</h2>
                   <p className="text-xl text-white/50">Follow the path of intelligence from prompt to chart.</p>
                 </div>
                 
                 <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent hidden pb-10 sm:block">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="w-12 h-12 bg-black border-2 border-purple-500/50 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 group-hover:scale-110 transition"><Database className="w-5 h-5 text-purple-400"/></div>
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:pr-8 md:text-right">
                          <h4 className="text-xl font-bold text-white mb-2">1. Connect Data</h4>
                          <p className="text-white/50">Inject your SQLAlchemy URL and securely connect your DB.</p>
                       </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal group is-active gap-8 md:gap-0">
                       <div className="w-12 h-12 bg-black border border-white/10 rounded-full flex items-center justify-center z-10 shrink-0 group-hover:border-blue-500/50 transition"><Bot className="w-5 h-5 text-white/50 group-hover:text-blue-400"/></div>
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pr-4 md:pr-0 md:pl-8">
                          <h4 className="text-xl font-bold text-white mb-2">2. NL to SQL</h4>
                          <p className="text-white/50">LangChain interprets human intent and translates into raw SQL.</p>
                       </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="w-12 h-12 bg-black border border-white/10 rounded-full flex items-center justify-center z-10 shrink-0 group-hover:border-cyan-500/50 transition"><Code2 className="w-5 h-5 text-white/50 group-hover:text-cyan-400"/></div>
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:pr-8 md:text-right">
                          <h4 className="text-xl font-bold text-white mb-2">3. Rendering</h4>
                          <p className="text-white/50">Execution engine returns parsed results directly to UI components.</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="w-full lg:w-1/2">
                 <TiltGlowCard className="!rounded-3xl border border-white/10 bg-black backdrop-blur-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] relative transition duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-transparent mix-blend-screen pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                    <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/[0.02]">
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-red-500 transition cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-amber-500 transition cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-green-500 transition cursor-pointer"></div>
                      <div className="mx-auto text-xs font-mono text-white/40 flex items-center gap-2"><TerminalSquare className="w-3 h-3"/> query-runtime.sh</div>
                    </div>
                    <div className="p-6 font-mono text-sm leading-relaxed text-white/80 h-[380px] overflow-hidden relative">
                      <div className="text-cyan-400">~/nexus ❯ <span className="text-white">analyze users table</span></div>
                      <div className="mt-4 text-white/40 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Initializing LangChain Agent...</div>
                      <div className="mt-2 text-purple-400">Thought: Extracting DB schema...</div>
                      <div className="mt-2 text-white/80">Action: <span className="text-blue-400 font-semibold">Execute SQL</span></div>
                      <div className="mt-2 text-white/40">Query: <span className="text-green-400">SELECT id, role, created FROM users LIMIT 5;</span></div>
                      <div className="mt-6 border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                         <div className="flex bg-white/5 border-b border-white/10 py-1.5 px-3 shadow-inner">
                           <div className="flex-1 text-white/40 text-xs font-bold uppercase tracking-wider">ID</div>
                           <div className="flex-1 text-white/40 text-xs font-bold uppercase tracking-wider">Role</div>
                           <div className="flex-1 text-white/40 text-xs font-bold uppercase tracking-wider">Created</div>
                         </div>
                         <div className="py-2 px-3 text-xs opacity-70">
                           <div className="flex py-1 hover:bg-white/5 transition"><div className="flex-1">1</div><div className="flex-1">Admin</div><div className="flex-1">2026-04</div></div>
                           <div className="flex py-1 hover:bg-white/5 transition"><div className="flex-1">2</div><div className="flex-1">User</div><div className="flex-1">2026-04</div></div>
                           <div className="flex py-1 hover:bg-white/5 transition"><div className="flex-1">3</div><div className="flex-1">User</div><div className="flex-1">2026-04</div></div>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                    </div>
                 </TiltGlowCard>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.05] bg-black pt-20 pb-10 z-20 w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-white/50 mb-16">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Hexagon className="w-6 h-6 text-cyan-500"/>
                  <span className="font-bold text-white text-lg tracking-tight">Nexus.</span>
                </div>
                <p className="max-w-xs leading-relaxed text-white/50 font-medium">An enterprise-grade autonomous NLP to SQL intelligence engine building the future of internal data tools.</p>
             </div>
             <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide">Platform</h4>
                <ul className="space-y-3">
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Features</a></li>
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Workflow Engine</a></li>
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Enterprise Security</a></li>
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Pricing and Limits</a></li>
                </ul>
             </div>
             <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide">Connect</h4>
                <ul className="space-y-3">
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">GitHub Repository</a></li>
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">Twitter Profile</a></li>
                   <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">LinkedIn Network</a></li>
                </ul>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 font-medium">
            <p>© {new Date().getFullYear()} Nexus AI, Inc. All rights reserved.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition">Privacy Policy</a>
               <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}

