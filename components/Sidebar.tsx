import React from 'react';
import { LayoutDashboard, UserPlus, CalendarClock, Pill, Receipt, Activity } from 'lucide-react';
import { AgentType } from '../types';

interface SidebarProps {
  activeAgent: AgentType;
}

const Sidebar: React.FC<SidebarProps> = ({ activeAgent }) => {
  const menuItems = [
    { type: AgentType.CENTRAL_MANAGER, label: 'Central Command', icon: LayoutDashboard },
    { type: AgentType.ADMISSION, label: 'Admissions', icon: UserPlus },
    { type: AgentType.SCHEDULING, label: 'Scheduling', icon: CalendarClock },
    { type: AgentType.PHARMACY, label: 'Pharmacy', icon: Pill },
    { type: AgentType.BILLING, label: 'Billing & Finance', icon: Receipt },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col hidden md:flex shadow-lg z-10">
      <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">MediOps AI</h1>
          <p className="text-xs text-gray-500">Agentic Hospital System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeAgent === item.type;
          // Sub-agents are only "visually" active if they are currently processing or selected
          // For this demo, we highlight the agent that the Central Manager delegated to
          
          return (
            <div
              key={item.type}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-100' 
                  : 'text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Hospital Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
