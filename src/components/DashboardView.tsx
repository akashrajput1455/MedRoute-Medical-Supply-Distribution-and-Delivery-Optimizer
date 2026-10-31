/**
 * Dashboard View for MedRoute
 * Professional logistics overview with metric cards, map preview,
 * algorithm execution chart, and recent route calculations.
 */

import React from 'react';
import { 
  Hospital, 
  Warehouse, 
  MapPin, 
  Route, 
  Network, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Play,
  Plus
} from 'lucide-react';
import { MedicalLocation, NetworkEdge, RouteHistoryRecord, TabType } from '../types';
import { LeafletMap } from './LeafletMap';

interface DashboardViewProps {
  locations: MedicalLocation[];
  edges: NetworkEdge[];
  history: RouteHistoryRecord[];
  onNavigate: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  locations,
  edges,
  history,
  onNavigate,
  onOpenAddModal
}) => {
  const hospitalCount = locations.filter(l => l.locationType === 'Hospital').length;
  const distributionCount = locations.filter(l => l.locationType === 'Distribution Center').length;

  // Sample or measured execution benchmarks for dashboard chart preview
  const algorithmStats = [
    { name: "Dijkstra's Shortest Path", timeMs: 0.18, complexity: 'O((V+E) log V)', type: 'Routing' },
    { name: "Prim's MST", timeMs: 0.14, complexity: 'O(E log V)', type: 'Spanning Tree' },
    { name: "Kruskal's MST", timeMs: 0.16, complexity: 'O(E log E)', type: 'Spanning Tree' },
    { name: "0/1 Knapsack (DP)", timeMs: 0.22, complexity: 'O(n * W)', type: 'Allocation' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Academic Disclaimer Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-950">
        <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5">
          <Route size={18} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-blue-900">
            MedRoute: Design & Analysis of Algorithms for Medical Supply Logistics
          </h3>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Academic MCA Mini Project demonstrating <strong>Dijkstra's Algorithm</strong> for graph routing, 
            <strong> Prim's & Kruskal's</strong> for network minimum spanning trees, and <strong>0/1 Knapsack</strong> for payload capacity allocation, 
            cross-referenced with <strong>OSRM</strong> for actual road routes.
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => onNavigate('route-planner')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1"
          >
            <Play size={13} />
            <span>Launch Planner</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Locations */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MapPin size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{locations.length}</div>
            <div className="text-xs text-slate-500 font-medium">Medical Locations</div>
          </div>
        </div>

        {/* Distribution Centers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Warehouse size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{distributionCount}</div>
            <div className="text-xs text-slate-500 font-medium">Distribution Hubs</div>
          </div>
        </div>

        {/* Hospitals */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Hospital size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{hospitalCount}</div>
            <div className="text-xs text-slate-500 font-medium">Hospitals</div>
          </div>
        </div>

        {/* Network Connections */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Network size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{edges.length}</div>
            <div className="text-xs text-slate-500 font-medium">Graph Connections</div>
          </div>
        </div>

        {/* Saved Calculations */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{history.length}</div>
            <div className="text-xs text-slate-500 font-medium">Route Histories</div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Map Preview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Geographic Network Preview</h3>
              <p className="text-xs text-slate-500">Live Leaflet map with OpenStreetMap tiles</p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>Full Map</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <LeafletMap locations={locations} height="280px" />
        </div>

        {/* Quick Actions & Algorithm Execution Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Quick DAA Actions</h3>
            <p className="text-xs text-slate-500 mb-3">Execute core algorithms with sample data</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('route-planner')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Route size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Calculate Shortest Route</div>
                    <div className="text-[11px] text-slate-500">Dijkstra vs OSRM road route</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigate('network')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Network size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Network Spanning Tree</div>
                    <div className="text-[11px] text-slate-500">Compare Prim's & Kruskal's MST</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigate('supply')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Hospital size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Supply Vehicle Allocation</div>
                    <div className="text-[11px] text-slate-500">0/1 Knapsack DP optimizer</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={onOpenAddModal}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Add New Facility</div>
                    <div className="text-[11px] text-slate-500">Hospital or Distribution Hub</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Algorithm Time Complexity & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAA Algorithm Profiles */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">DAA Algorithms Profile</h3>
              <p className="text-xs text-slate-500">Theoretical vs measured benchmarks</p>
            </div>
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>Full Benchmark</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {algorithmStats.map(algo => (
              <div key={algo.name} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{algo.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Category: <span className="text-slate-700 font-medium">{algo.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-teal-700">{algo.complexity}</div>
                  <div className="text-[11px] text-slate-500">~{algo.timeMs} ms (Sample)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Route History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Route Calculations</h3>
              <p className="text-xs text-slate-500">Logged comparison of graph vs road estimates</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>All History</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent route calculations logged. Use the Route Planner to evaluate a medical transport route.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.slice(0, 4).map(rec => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{rec.sourceName}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span>{rec.destinationName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {rec.timestamp}
                      </span>
                      <span>•</span>
                      <span className="text-teal-600 font-medium">{rec.algorithmName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-700">
                      {rec.roadDistanceKm ? `${rec.roadDistanceKm} km road` : `${rec.graphDistanceKm} km graph`}
                    </div>
                    {rec.estimatedDurationMinutes && (
                      <div className="text-[11px] text-slate-500">
                        ~{rec.estimatedDurationMinutes} mins
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
