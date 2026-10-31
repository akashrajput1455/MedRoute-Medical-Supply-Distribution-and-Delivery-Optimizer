/**
 * Network Optimization & Minimum Spanning Tree (MST) View for MedRoute
 * Compares Prim's vs Kruskal's algorithms on the medical transportation graph,
 * verifies total weight parity, and manages network edges.
 */

import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Layers, 
  Scale, 
  Info,
  Clock
} from 'lucide-react';
import { MedicalLocation, NetworkEdge, MSTResult } from '../types';
import { LeafletMap } from './LeafletMap';
import { primMST } from '../algorithms/prim';
import { kruskalMST } from '../algorithms/kruskal';

interface NetworkOptimizationViewProps {
  locations: MedicalLocation[];
  edges: NetworkEdge[];
  onAddEdge: (sourceId: number, destId: number, distanceKm: number) => void;
  onDeleteEdge: (edgeId: number) => void;
}

export const NetworkOptimizationView: React.FC<NetworkOptimizationViewProps> = ({
  locations,
  edges,
  onAddEdge,
  onDeleteEdge
}) => {
  const [activeAlgoTab, setActiveAlgoTab] = useState<'both' | 'prim' | 'kruskal'>('both');
  const [isAddEdgeModalOpen, setIsAddEdgeModalOpen] = useState(false);

  // Form State for new connection
  const [newSourceId, setNewSourceId] = useState<number>(locations[0]?.id || 1);
  const [newDestId, setNewDestId] = useState<number>(locations[1]?.id || 2);
  const [newDistanceKm, setNewDistanceKm] = useState<string>('5.0');
  const [edgeFormError, setEdgeFormError] = useState<string>('');

  // 1. Prepare vertices & edges for MST algorithms
  const vertices = locations.map(l => l.id);
  const edgeTuples: [number, number, number][] = edges.map(e => [
    e.sourceLocationId,
    e.destinationLocationId,
    e.distanceKm
  ]);

  // Execute both MST algorithms
  const primResult: MSTResult = primMST(vertices, edgeTuples);
  const kruskalResult: MSTResult = kruskalMST(vertices, edgeTuples);

  const locMap = new Map<number, MedicalLocation>(locations.map(l => [l.id, l]));

  // Populate location names on edges
  const enrichEdges = (mstEdges: typeof primResult.selectedEdges) => {
    return mstEdges.map(e => ({
      ...e,
      sourceName: locMap.get(e.source)?.name || `Node #${e.source}`,
      destinationName: locMap.get(e.destination)?.name || `Node #${e.destination}`
    }));
  };

  const enrichedPrimEdges = enrichEdges(primResult.selectedEdges);
  const enrichedKruskalEdges = enrichEdges(kruskalResult.selectedEdges);

  // Parity check: In graph theory, any minimum spanning tree on the same connected graph
  // must have identical total weight!
  const weightsMatch = Math.abs(primResult.totalMstDistanceKm - kruskalResult.totalMstDistanceKm) < 0.01;

  // Selected edges to highlight on Leaflet map
  const activeMstEdges = activeAlgoTab === 'kruskal' ? kruskalResult.selectedEdges : primResult.selectedEdges;
  const highlightedPairs = activeMstEdges.map(e => ({ uId: e.source, vId: e.destination }));

  // All graph edges for map background
  const allNetworkEdgesForMap = edges
    .filter(e => locMap.has(e.sourceLocationId) && locMap.has(e.destinationLocationId))
    .map(e => ({
      u: locMap.get(e.sourceLocationId)!,
      v: locMap.get(e.destinationLocationId)!,
      distKm: e.distanceKm
    }));

  const handleAddEdgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEdgeFormError('');

    if (newSourceId === newDestId) {
      setEdgeFormError('Source and destination cannot be the same medical location.');
      return;
    }

    const dist = parseFloat(newDistanceKm);
    if (isNaN(dist) || dist <= 0) {
      setEdgeFormError('Distance must be a positive number in kilometers.');
      return;
    }

    // Check if edge already exists
    const exists = edges.some(
      ed => (ed.sourceLocationId === newSourceId && ed.destinationLocationId === newDestId) ||
            (ed.sourceLocationId === newDestId && ed.destinationLocationId === newSourceId)
    );

    if (exists) {
      setEdgeFormError('A connection between these two medical locations already exists.');
      return;
    }

    onAddEdge(newSourceId, newDestId, dist);
    setIsAddEdgeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Concept Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Network size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Minimum Spanning Tree (MST) Optimization
            </h3>
            <p className="text-xs text-slate-500">
              Connects all {locations.length} healthcare facilities with minimum total road length without cycles.
            </p>
          </div>
        </div>

        {/* Parity Status Badge */}
        <div className="flex items-center gap-2">
          {weightsMatch && primResult.isConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Weight Parity Verified: {primResult.totalMstDistanceKm} km</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>Disconnected Graph</span>
            </div>
          )}

          <button
            onClick={() => setIsAddEdgeModalOpen(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add Connection</span>
          </button>
        </div>
      </div>

      {/* Map with Highlighted MST Edges */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-2">
            <Layers size={14} className="text-teal-600" />
            <span>MST Spanning Topology (Green Lines = Optimal Spanning Tree Edges)</span>
          </span>
          <span className="text-slate-500">
            Total Graph Distance: <strong className="text-slate-900">{edges.reduce((a, b) => a + b.distanceKm, 0).toFixed(2)} km</strong>
          </span>
        </div>
        <LeafletMap
          locations={locations}
          showAllNetworkEdges={allNetworkEdgesForMap}
          highlightedEdgePairs={highlightedPairs}
          height="360px"
        />
      </div>

      {/* Side-by-Side Algorithm Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prim's Algorithm Result Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Prim's Algorithm</h4>
                <p className="text-[11px] text-slate-500">Vertex/Cut-based greedy expansion</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              O(E log V)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total MST Distance:</span>
              <span className="text-base font-bold text-teal-800 font-mono">
                {primResult.totalMstDistanceKm} km
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Selected Edges:</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {primResult.edgeCount} edges
              </span>
            </div>
            {primResult.executionTimeMs !== undefined && (
              <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> Execution Time:
                </span>
                <span className="font-mono text-teal-700 font-semibold">{primResult.executionTimeMs} ms</span>
              </div>
            )}
          </div>

          <div>
            <h5 className="font-semibold text-xs text-slate-700 mb-2">Selected MST Road Connections:</h5>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
              {enrichedPrimEdges.map((e, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {e.sourceName} ↔ {e.destinationName}
                  </span>
                  <span className="font-mono font-bold text-teal-700">{e.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kruskal's Algorithm Result Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Kruskal's Algorithm</h4>
                <p className="text-[11px] text-slate-500">Edge-based with Disjoint Set Union (DSU)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              O(E log E)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total MST Distance:</span>
              <span className="text-base font-bold text-indigo-800 font-mono">
                {kruskalResult.totalMstDistanceKm} km
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Selected Edges:</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {kruskalResult.edgeCount} edges
              </span>
            </div>
            {kruskalResult.executionTimeMs !== undefined && (
              <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> Execution Time:
                </span>
                <span className="font-mono text-indigo-700 font-semibold">{kruskalResult.executionTimeMs} ms</span>
              </div>
            )}
          </div>

          <div>
            <h5 className="font-semibold text-xs text-slate-700 mb-2">Selected MST Road Connections:</h5>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
              {enrichedKruskalEdges.map((e, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {e.sourceName} ↔ {e.destinationName}
                  </span>
                  <span className="font-mono font-bold text-indigo-700">{e.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Graph Connections Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Stored Network Graph Connections ({edges.length})</h4>
            <p className="text-xs text-slate-500">Undirected weighted edges stored in MySQL database</p>
          </div>
          <button
            onClick={() => setIsAddEdgeModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
          >
            <Plus size={13} />
            <span>New Edge</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Edge ID</th>
                <th className="py-2.5 px-3">Endpoint A</th>
                <th className="py-2.5 px-3">Endpoint B</th>
                <th className="py-2.5 px-3">Distance (km)</th>
                <th className="py-2.5 px-3">Part of MST?</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {edges.map(ed => {
                const u = locMap.get(ed.sourceLocationId);
                const v = locMap.get(ed.destinationLocationId);
                const inPrimMST = primResult.selectedEdges.some(
                  m => (m.source === ed.sourceLocationId && m.destination === ed.destinationLocationId) ||
                       (m.source === ed.destinationLocationId && m.destination === ed.sourceLocationId)
                );

                return (
                  <tr key={ed.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{ed.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{u?.name || `Node #${ed.sourceLocationId}`}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{v?.name || `Node #${ed.destinationLocationId}`}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{ed.distanceKm} km</td>
                    <td className="py-2.5 px-3">
                      {inPrimMST ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Included in MST
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100">
                          Redundant (Cycle)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onDeleteEdge(ed.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="Delete connection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Connection Modal */}
      {isAddEdgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Medical Network Connection</h3>

            {edgeFormError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {edgeFormError}
              </div>
            )}

            <form onSubmit={handleAddEdgeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Location</label>
                <select
                  value={newSourceId}
                  onChange={e => setNewSourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Location</label>
                <select
                  value={newDestId}
                  onChange={e => setNewDestId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Distance (Kilometers) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.1"
                  value={newDistanceKm}
                  onChange={e => setNewDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  placeholder="e.g. 7.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEdgeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
