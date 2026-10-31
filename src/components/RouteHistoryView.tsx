/**
 * Route History View for MedRoute
 * Persistent audit trail of evaluated medical transport paths,
 * comparing graph vs road metrics with 1-click reload.
 */

import React from 'react';
import { 
  History, 
  ArrowRight, 
  Clock, 
  Navigation, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { RouteHistoryRecord } from '../types';

interface RouteHistoryViewProps {
  history: RouteHistoryRecord[];
  onClearHistory: () => void;
  onSelectHistoricalRoute?: (sourceId: number, destId: number) => void;
}

export const RouteHistoryView: React.FC<RouteHistoryViewProps> = ({
  history,
  onClearHistory,
  onSelectHistoricalRoute
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History size={16} className="text-teal-600" />
            <span>Historical Route Calculations ({history.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all evaluated supply routes between distribution hubs and medical centers.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Clear History Log</span>
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Source Facility</th>
                <th className="py-3 px-4">Destination Facility</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4 text-teal-700">Dijkstra Graph Dist</th>
                <th className="py-3 px-4 text-blue-700">OSRM Road Dist</th>
                <th className="py-3 px-4">Est. Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400 italic">
                    No route history recorded yet. Use the Route Planner to evaluate a route.
                  </td>
                </tr>
              ) : (
                history.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{record.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[180px] truncate" title={record.sourceName}>
                      {record.sourceName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[180px] truncate" title={record.destinationName}>
                      {record.destinationName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {record.algorithmName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">
                      {record.graphDistanceKm !== null ? `${record.graphDistanceKm} km` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {record.roadDistanceKm !== null ? `${record.roadDistanceKm} km` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {record.estimatedDurationMinutes !== null ? `~${record.estimatedDurationMinutes} mins` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        record.routeStatus === 'Success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {record.routeStatus === 'Success' ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : (
                          <AlertCircle size={11} className="text-amber-600" />
                        )}
                        <span>{record.routeStatus}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {record.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onSelectHistoricalRoute && (
                        <button
                          onClick={() => onSelectHistoricalRoute(record.sourceLocationId, record.destinationLocationId)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded text-xs font-semibold transition"
                          title="Recalculate route on map"
                        >
                          Plan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
