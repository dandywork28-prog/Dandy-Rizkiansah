import React from 'react';
import { Message, AgentType } from '../types';
import { AGENT_ICONS, AGENT_COLORS } from '../constants';
import { User, LayoutDashboard, UserPlus, CalendarClock, Pill, Receipt, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Icon mapping
  const IconComponent = () => {
    if (isUser) return <User className="w-5 h-5" />;
    
    switch (message.agent) {
      case AgentType.ADMISSION: return <UserPlus className="w-5 h-5" />;
      case AgentType.SCHEDULING: return <CalendarClock className="w-5 h-5" />;
      case AgentType.PHARMACY: return <Pill className="w-5 h-5" />;
      case AgentType.BILLING: return <Receipt className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  if (message.isDelegation) {
    return (
      <div className="flex justify-center my-4 opacity-0 animate-fadeIn" style={{animationFillMode: 'forwards', animationName: 'fadeIn', animationDuration: '0.5s'}}>
        <div className="bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm flex items-center space-x-2 shadow-sm">
          <LayoutDashboard className="w-3 h-3 text-gray-500" />
          <span>Central Manager:</span>
          <span className="font-medium flex items-center">
            Delegating to {message.agent} <ArrowRight className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
          ${isUser ? 'bg-gray-700 text-white' : (message.agent && AGENT_COLORS[message.agent]) || 'bg-gray-200'}
        `}>
          <IconComponent />
        </div>

        {/* Content */}
        <div className={`
          flex flex-col 
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className="flex items-center space-x-2 mb-1">
             <span className="text-xs font-semibold text-gray-500">
               {isUser ? 'You' : message.agent}
             </span>
             <span className="text-xs text-gray-300">
               {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
          
          <div className={`
            p-4 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}
          `}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none">
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
