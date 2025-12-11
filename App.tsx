import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { AgentType, Message } from './types';
import { routeRequest, executeAgentTask } from './services/geminiService';
import { Send, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.CENTRAL_MANAGER);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello. I am the **Central Manager** for Hospital Operations. I can help you with Patient Admissions, Scheduling, Pharmacy, or Billing.\n\n*How may I assist you today?*",
      agent: AgentType.CENTRAL_MANAGER,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  
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
    setProcessingStep('Analyzing request...');

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
      setProcessingStep(`${routingResult.targetAgent} is working...`);

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
        // Fallback if no delegation occurred
        const fallbackMsg: Message = {
          id: `fallback-${Date.now()}`,
          role: 'model',
          content: "I'm not sure which department handles that. Could you please specify if this is related to Admissions, Scheduling, Pharmacy, or Billing?",
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
        content: "An error occurred while processing your request. Please ensure your API Key is valid.",
        agent: AgentType.CENTRAL_MANAGER,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      // Reset back to Central Manager visually after task is done? 
      // Or keep it on the last agent. Let's keep last agent to show state.
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration Missing</h2>
                <p className="text-gray-600 mb-6">
                    The <code>API_KEY</code> environment variable is missing. This application requires a valid Google Gemini API key to function.
                </p>
                <div className="text-sm bg-gray-100 p-3 rounded text-left font-mono text-gray-700">
                    process.env.API_KEY
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeAgent={activeAgent} />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Header - Mobile friendly */}
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between md:justify-end shadow-sm z-10">
          <div className="md:hidden font-bold text-gray-800 flex items-center gap-2">
             <ActivityIcon /> MediOps AI
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>System Operational</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide">
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {isProcessing && (
              <div className="flex justify-center items-center py-4 animate-pulse">
                <div className="bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-800">{processingStep}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="absolute -top-10 left-0 flex space-x-2">
                 {/* Suggestion Chips could go here */}
            </div>
            
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Register patient John Doe, DOB 1980, for a flu checkup..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-gray-700 placeholder-gray-400"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isProcessing}
                className={`absolute right-2 p-2 rounded-xl transition-all duration-200 ${
                  inputText.trim() && !isProcessing
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              AI Agents can make mistakes. Please verify important medical information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Simple Icon for Mobile Header
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

export default App;
