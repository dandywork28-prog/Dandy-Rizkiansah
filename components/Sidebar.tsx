import React from 'react';
import { LayoutDashboard, UserPlus, CalendarClock, Pill, Receipt, Activity, Settings, LogOut } from 'lucide-react';
import { AgentType } from '../types';

interface SidebarProps {
  activeAgent: AgentType;
  onAgentSelect: (agent: AgentType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeAgent, onAgentSelect }) => {
  const menuItems = [
    { type: AgentType.CENTRAL_MANAGER, label: 'Central Command', icon: LayoutDashboard },
    { type: AgentType.ADMISSION, label: 'Patient Admissions', icon: UserPlus },
    { type: AgentType.SCHEDULING, label: 'Doctor Scheduling', icon: CalendarClock },
    { type: AgentType.PHARMACY, label: 'Pharmacy Mgmt', icon: Pill },
    { type: AgentType.BILLING, label: 'Billing & Finance', icon: Receipt },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen flex flex-col shadow-2xl z-20 text-white border-r border-slate-800">
      {/* Header Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800 bg-slate-950">
        <div className="bg-teal-500 p-2 rounded-lg shadow-lg shadow-teal-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-display tracking-wide">Nusantara<span className="text-teal-400">Health</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">AI Operations System</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modules</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeAgent === item.type;
          
          return (
            <button
              key={item.type}
              onClick={() => onAgentSelect(item.type)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer text-left ${
                isActive 
                  ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-400'}`} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100" 
              alt="Admin" 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-teal-500 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">Dr. Arief Wibowo</p>
            <p className="text-xs text-slate-500 truncate group-hover:text-teal-400 transition-colors">Chief of Operations</p>
          </div>
          <Settings className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:rotate-90 transition-all" />
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-600">
          v2.5.0 Stable • Secured via SSL
        </div>
      </div>
    </div>
  );
};

export default Sidebar;