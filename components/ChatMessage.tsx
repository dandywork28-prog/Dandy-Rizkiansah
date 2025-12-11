import React from 'react';
import { Message, AgentType } from '../types';
import { AGENT_COLORS } from '../constants';
import { User, LayoutDashboard, UserPlus, CalendarClock, Pill, Receipt, ArrowRight, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Icon mapping
  const IconComponent = () => {
    if (isUser) return <User className="w-5 h-5 text-white" />;
    
    switch (message.agent) {
      case AgentType.ADMISSION: return <UserPlus className="w-5 h-5 text-white" />;
      case AgentType.SCHEDULING: return <CalendarClock className="w-5 h-5 text-white" />;
      case AgentType.PHARMACY: return <Pill className="w-5 h-5 text-white" />;
      case AgentType.BILLING: return <Receipt className="w-5 h-5 text-white" />;
      default: return <LayoutDashboard className="w-5 h-5 text-white" />;
    }
  };

  // Agent Specific Border/Shadow colors
  const getAgentStyles = () => {
    switch(message.agent) {
        case AgentType.ADMISSION: return "border-blue-100 bg-blue-50/50";
        case AgentType.SCHEDULING: return "border-purple-100 bg-purple-50/50";
        case AgentType.PHARMACY: return "border-emerald-100 bg-emerald-50/50";
        case AgentType.BILLING: return "border-amber-100 bg-amber-50/50";
        default: return "border-slate-100 bg-white";
    }
  };

  if (message.isDelegation) {
    return (
      <div className="flex justify-center my-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="bg-slate-800/90 backdrop-blur-sm text-slate-200 px-5 py-2 rounded-full text-xs font-medium flex items-center space-x-2 shadow-lg border border-slate-700">
          <Bot className="w-3.5 h-3.5 text-teal-400" />
          <span className="opacity-75">Central Manager:</span>
          <span className="flex items-center text-teal-300">
            Routing to {message.agent} <ArrowRight className="w-3 h-3 ml-1.5" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105
          ${isUser ? 'bg-slate-700' : (message.agent && AGENT_COLORS[message.agent]) || 'bg-slate-800'}
        `}>
          <IconComponent />
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center space-x-2 mb-1.5 px-1">
             <span className={`text-[11px] font-bold uppercase tracking-wider ${isUser ? 'text-slate-600' : 'text-slate-500'}`}>
               {isUser ? 'Administrator' : message.agent}
             </span>
             <span className="text-[10px] text-slate-400 font-medium bg-white/50 px-1.5 py-0.5 rounded">
               {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
          
          <div className={`
            p-5 rounded-2xl text-[14px] leading-relaxed shadow-sm backdrop-blur-sm
            ${isUser 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm shadow-slate-300' 
              : `text-slate-700 rounded-tl-sm border ${getAgentStyles()} shadow-sm`}
          `}>
            {isUser ? (
              <p className="font-sans">{message.content}</p>
            ) : (
              <div className="prose prose-sm prose-slate max-w-none prose-p:font-sans prose-headings:font-display prose-headings:text-slate-800 prose-strong:text-slate-900 prose-a:text-blue-600">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;