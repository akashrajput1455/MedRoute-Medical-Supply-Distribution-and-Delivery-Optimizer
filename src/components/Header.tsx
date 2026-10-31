/**
 * Header Component for MedRoute
 * Displays current page title, academic project badge, quick actions, and status.
 */

import React from 'react';
import { TabType } from '../types';
import { Route, Plus, Activity, Cpu } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
  collapsed: boolean;
}

const TAB_TITLES: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Medical Logistics Dashboard',
    subtitle: 'System overview, active healthcare facilities, and recent route calculations'
  },
  map: {
    title: 'Interactive Medical Network Map',
    subtitle: 'Geographic distribution of hospitals and central medical distribution hubs'
  },
  locations: {
    title: 'Medical Location Management',
    subtitle: 'Maintain healthcare facility registry, verified GPS coordinates, and contact details'
  },
  'route-planner': {
    title: 'Intelligent Route Planner',
    subtitle: 'Compare Dijkstra Shortest Path (Graph) with OSRM Real Road Route'
  },
  network: {
    title: 'Network Optimization & MST',
    subtitle: 'Minimum Spanning Tree comparison between Prim\'s and Kruskal\'s algorithms'
  },
  supply: {
    title: 'Supply Allocation (0/1 Knapsack)',
    subtitle: 'Optimal payload selection under vehicle capacity constraint using Dynamic Programming'
  },
  analysis: {
    title: 'Algorithm Performance & Analysis',
    subtitle: 'Empirical execution time benchmarking and theoretical DAA Big-O complexity'
  },
  history: {
    title: 'Route Calculation History',
    subtitle: 'Audit log of evaluated medical transport paths, distances, and driving durations'
  },
  'python-code': {
    title: 'Python Backend & Project Source Code',
    subtitle: 'View and download clean Python algorithm modules, Flask server, and MySQL schema'
  },
  about: {
    title: 'About MedRoute & Academic Documentation',
    subtitle: 'MCA mini project report summary, mathematical graph formulation, and viva guide'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  collapsed
}) => {
  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'MedRoute System',
    subtitle: 'Design and Analysis of Algorithms for Healthcare Logistics'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentInfo.title}</h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Cpu size={12} className="text-teal-600" />
            DAA Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={() => onTabChange('route-planner')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition shadow-sm"
        >
          <Route size={14} className="text-blue-600" />
          <span>Plan Route</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-sm"
        >
          <Plus size={14} />
          <span>Add Location</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span>Live Demo Ready</span>
        </div>
      </div>
    </header>
  );
};
