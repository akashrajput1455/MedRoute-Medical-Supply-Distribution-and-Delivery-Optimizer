/**
 * Algorithm Analysis View for MedRoute
 * Empirical DAA performance benchmarking, execution charts,
 * and theoretical Big-O complexity breakdown.
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Play, 
  Cpu, 
  RotateCcw, 
  Clock, 
  Table, 
  CheckCircle2, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { BenchmarkItem } from '../types';
import { runLiveBenchmark } from '../algorithms/benchmark';

export const AlgorithmAnalysisView: React.FC = () => {
  // Pre-loaded initial reproducible benchmark data
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([
    {
      scale: 'Small',
      graphVertices: 8,
      graphEdges: 13,
      knapsackItems: 10,
      knapsackCapacity: 50,
      dijkstraMs: 0.12,
      primMs: 0.09,
      kruskalMs: 0.11,
      knapsackMs: 0.14,
      mstWeightPrim: 68.4,
      mstWeightKruskal: 68.4
    },
    {
      scale: 'Medium',
      graphVertices: 25,
      graphEdges: 59,
      knapsackItems: 40,
      knapsackCapacity: 150,
      dijkstraMs: 0.38,
      primMs: 0.32,
      kruskalMs: 0.41,
      knapsackMs: 0.85,
      mstWeightPrim: 184.2,
      mstWeightKruskal: 184.2
    },
    {
      scale: 'Large',
      graphVertices: 75,
      graphEdges: 214,
      knapsackItems: 100,
      knapsackCapacity: 300,
      dijkstraMs: 1.15,
      primMs: 0.98,
      kruskalMs: 1.45,
      knapsackMs: 3.42,
      mstWeightPrim: 432.8,
      mstWeightKruskal: 432.8
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string>('Seed Benchmark');
  const [selectedScale, setSelectedScale] = useState<string>('Medium');

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runLiveBenchmark();
      setBenchmarks(results);
      setLastRunTime(new Date().toLocaleTimeString());
      setIsRunning(false);
    }, 150);
  };

  const currentBenchmark = benchmarks.find(b => b.scale === selectedScale) || benchmarks[1];

  // Dynamic SVG Bar Chart calculation
  const maxMs = Math.max(
    currentBenchmark.dijkstraMs,
    currentBenchmark.primMs,
    currentBenchmark.kruskalMs,
    currentBenchmark.knapsackMs,
    0.5
  );

  const chartBars = [
    { name: 'Dijkstra', full: "Dijkstra's Shortest Path", ms: currentBenchmark.dijkstraMs, color: '#0d9488', complexity: 'O((V+E) log V)' },
    { name: 'Prim MST', full: "Prim's Algorithm", ms: currentBenchmark.primMs, color: '#0284c7', complexity: 'O(E log V)' },
    { name: 'Kruskal MST', full: "Kruskal's Algorithm", ms: currentBenchmark.kruskalMs, color: '#4f46e5', complexity: 'O(E log E)' },
    { name: '0/1 Knapsack', full: '0/1 Knapsack (DP)', ms: currentBenchmark.knapsackMs, color: '#9333ea', complexity: 'O(n * W)' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Run Controller */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Empirical DAA Benchmark & Complexity Analysis
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono font-semibold border border-teal-200">
              High-Precision Timer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Measured execution times across Small, Medium, and Large test graph datasets. Last run: {lastRunTime}
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Benchmarking...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Run Live Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Dataset Scale Selector and Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Execution Time Comparison (Milliseconds)</h4>
            <p className="text-xs text-slate-500">Lower execution time indicates faster wall-clock running speed</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Dataset Scale:</span>
            {['Small', 'Medium', 'Large'].map(sc => (
              <button
                key={sc}
                onClick={() => setSelectedScale(sc)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedScale === sc
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Details Badge */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
          <div>
            Graph Scale: <strong className="text-slate-900">{currentBenchmark.graphVertices} Vertices</strong>,{' '}
            <strong className="text-slate-900">{currentBenchmark.graphEdges} Edges</strong>
          </div>
          <div>
            Knapsack Scale: <strong className="text-slate-900">{currentBenchmark.knapsackItems} Supply Items</strong>,{' '}
            Capacity <strong className="text-slate-900">{currentBenchmark.knapsackCapacity} kg</strong>
          </div>
          <div>
            MST Parity: <strong className="text-emerald-700">Prim = Kruskal = {currentBenchmark.mstWeightPrim} km</strong>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3 pt-2">
          {chartBars.map(bar => {
            const percent = Math.min(100, Math.max(5, (bar.ms / maxMs) * 100));
            return (
              <div key={bar.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: bar.color }}></span>
                    <span>{bar.full}</span>
                    <span className="font-mono text-[11px] text-slate-400 font-normal">({bar.complexity})</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{bar.ms} ms</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex items-center p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: bar.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Benchmark Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Table size={16} className="text-teal-600" />
          <span>Multiscale Benchmark Measurements Table</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Dataset Scale</th>
                <th className="py-2.5 px-3">Graph (V, E)</th>
                <th className="py-2.5 px-3">Knapsack (N, W)</th>
                <th className="py-2.5 px-3 text-teal-700">Dijkstra (ms)</th>
                <th className="py-2.5 px-3 text-sky-700">Prim MST (ms)</th>
                <th className="py-2.5 px-3 text-indigo-700">Kruskal MST (ms)</th>
                <th className="py-2.5 px-3 text-purple-700">Knapsack DP (ms)</th>
                <th className="py-2.5 px-3">MST Total Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map(b => (
                <tr key={b.scale} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{b.scale}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{b.graphVertices} V, {b.graphEdges} E</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{b.knapsackItems} items, {b.knapsackCapacity} kg</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-teal-700">{b.dijkstraMs} ms</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{b.primMs} ms</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">{b.kruskalMs} ms</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-purple-700">{b.knapsackMs} ms</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{b.mstWeightPrim} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Theoretical vs Measured Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm">Prim's vs Kruskal's Practical Observation</h4>
          <p>
            On sparse graphs where edge density <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">E ≈ V</code>, 
            <strong> Kruskal's algorithm</strong> with Disjoint Set Union performs exceedingly fast because sorting fewer edges takes very little time.
          </p>
          <p>
            On dense graphs where <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">E ≈ V²</code>, 
            <strong> Prim's algorithm</strong> using an adjacency list and binary heap often completes in fewer operations because edge sorting overhead is bypassed.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm">0/1 Knapsack Pseudo-Polynomial Nature</h4>
          <p>
            The dynamic programming approach has a time complexity of <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-purple-700">O(n * W)</code>.
            While linear in terms of <code className="font-mono">n</code>, it is proportional to the numeric value of the capacity <code className="font-mono">W</code> (pseudo-polynomial).
          </p>
          <p>
            For medical vehicle dispatch where payload capacity is typically bounded (e.g. 50 kg - 300 kg), this runs virtually instantaneously in a few milliseconds.
          </p>
        </div>
      </div>
    </div>
  );
};
