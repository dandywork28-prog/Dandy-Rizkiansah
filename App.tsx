import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { AgentType, Message } from './types';
import { routeRequest, executeAgentTask } from './services/geminiService';
import { Send, Loader2, Sparkles, AlertTriangle, Menu, X, Command } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.CENTRAL_MANAGER);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Selamat datang di **Nusantara Health AI**. \n\nSaya adalah **Manajer Pusat Operasional**. Saya siap membantu mengarahkan kebutuhan administrasi Anda ke departemen yang tepat (Pendaftaran, Jadwal Dokter, Farmasi, atau Keuangan).\n\n*Apa yang bisa saya bantu hari ini?*",
      agent: AgentType.CENTRAL_MANAGER,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processingStep]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    setProcessingStep('Analyzing Request...');

    try {
      // 1. Central Manager Routing
      setActiveAgent(AgentType.CENTRAL_MANAGER);
      const routingResult = await routeRequest(userMsg.content);

      // Add delegation log to chat
      const delegationMsg: Message = {
        id: `del-${Date.now()}`,
        role: 'system',
        content: routingResult.reason,
        agent: routingResult.targetAgent,
        timestamp: new Date(),
        isDelegation: true
      };
      setMessages(prev => [...prev, delegationMsg]);

      // Update UI to show new active agent
      setActiveAgent(routingResult.targetAgent);
      setProcessingStep(`${routingResult.targetAgent} Processing...`);

      // 2. Execute Task with Sub-Agent
      if (routingResult.targetAgent !== AgentType.CENTRAL_MANAGER) {
        // Small delay for UI realism
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const agentResponseText = await executeAgentTask(routingResult.targetAgent, routingResult.context);

        const agentMsg: Message = {
          id: `resp-${Date.now()}`,
          role: 'model',
          content: agentResponseText,
          agent: routingResult.targetAgent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, agentMsg]);
      } else {
        // Fallback
        const fallbackMsg: Message = {
          id: `fallback-${Date.now()}`,
          role: 'model',
          content: "Mohon maaf, saya belum bisa menentukan departemen yang tepat. Bisa tolong spesifikasikan apakah ini terkait Pendaftaran, Dokter, Obat, atau Tagihan?",
          agent: AgentType.CENTRAL_MANAGER,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }

    } catch (error) {
      console.error("App Error:", error);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: "Terjadi kesalahan sistem. Mohon periksa koneksi atau API Key Anda.",
        agent: AgentType.CENTRAL_MANAGER,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasApiKey = !!process.env.API_KEY;

  if (!hasApiKey) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-hospital p-4">
            <div className="max-w-md w-full glass-panel rounded-2xl shadow-2xl p-8 text-center border border-white/50">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-800 mb-3">System Configuration Error</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    Kunci API (API Key) tidak ditemukan. Sistem keamanan rumah sakit memerlukan kredensial valid untuk beroperasi.
                </p>
                <div className="text-sm bg-slate-900 text-slate-200 p-4 rounded-lg text-left font-mono shadow-inner">
                    MISSING: process.env.API_KEY
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-800">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar (Responsive) */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40`}>
        <Sidebar activeAgent={activeAgent} />
      </div>

      <main className="flex-1 flex flex-col h-full relative glass-panel m-0 md:m-4 md:rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="md:hidden font-bold font-display text-slate-800 flex items-center gap-2">
               <span className="text-teal-600">Nusantara</span>Health
            </div>
            <div className="hidden md:flex flex-col">
              <h2 className="text-lg font-bold font-display text-slate-800">Operational Command Center</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                System Online
                <span className="mx-1">•</span>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Command size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 shadow-lg border-2 border-white"></div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide bg-gradient-to-b from-white/40 to-white/10">
          <div className="max-w-4xl mx-auto w-full pb-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {isProcessing && (
              <div className="flex justify-center items-center py-6 animate-pulse">
                <div className="bg-white/90 backdrop-blur px-5 py-3 rounded-2xl shadow-lg border border-teal-100 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{processingStep}</span>
                    <span className="text-[10px] text-slate-500">AI is generating response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-slate-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Perintahkan sistem... (Contoh: Daftarkan pasien baru Budi Santoso untuk Poli Umum)"
                className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner text-slate-700 placeholder-slate-400 font-medium"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isProcessing}
                className={`absolute right-2 p-2.5 rounded-xl transition-all duration-300 transform ${
                  inputText.trim() && !isProcessing
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:scale-105 hover:-rotate-12' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
            <div className="mt-3 flex justify-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider opacity-60">
              <span>Secure Connection</span>
              <span>•</span>
              <span>HIPAA Compliant</span>
              <span>•</span>
              <span>AI Assisted</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;