/**
 * Sidebar Navigation Component for MedRoute
 * Professional dark navy styling with responsive collapse support
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Hospital, 
  Route, 
  Network, 
  Boxes, 
  BarChart3, 
  History, 
  FileCode, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'map', label: 'Interactive Map', icon: <MapIcon size={19} /> },
    { id: 'locations', label: 'Medical Locations', icon: <Hospital size={19} /> },
    { id: 'route-planner', label: 'Route Planner', icon: <Route size={19} />, badge: 'DAA' },
    { id: 'network', label: 'Network MST', icon: <Network size={19} /> },
    { id: 'supply', label: 'Supply Allocation', icon: <Boxes size={19} /> },
    { id: 'analysis', label: 'Algorithm Analysis', icon: <BarChart3 size={19} /> },
    { id: 'history', label: 'Route History', icon: <History size={19} /> },
    { id: 'python-code', label: 'Python Source Code', icon: <FileCode size={19} />, badge: 'Py/SQL' },
    { id: 'about', label: 'About Project', icon: <Info size={19} /> }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col justify-between border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
                <Hospital size={22} className="text-teal-400" />
              </div>
              <div className="leading-tight">
                <h1 className="font-bold text-white text-base tracking-tight">MedRoute</h1>
                <p className="text-[11px] text-teal-400 font-medium">DAA Optimization</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
              <Hospital size={22} className="text-teal-400" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 text-left truncate flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-semibold border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Student & Academic Tag */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>MCA Academic Project</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Design & Analysis of Algorithms • Python + MySQL + OSRM
            </p>
          </div>
        ) : (
          <div className="flex justify-center text-emerald-400 py-1" title="MCA Academic Project">
            <ShieldCheck size={18} />
          </div>
        )}
      </div>
    </aside>
  );
};
