/**
 * About Project View for MedRoute
 * Academic Mini Project Documentation for MCA (Design & Analysis of Algorithms)
 * Contains graph theory formulation, algorithm breakdown table, viva questions, and architecture.
 */

import React from 'react';
import { 
  Info, 
  BookOpen, 
  Cpu, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  FileText,
  Compass
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  const algorithmsSummary = [
    {
      name: "Dijkstra's Shortest Path",
      category: "Single-Source Shortest Path",
      dataStructure: "Binary Min-Heap (Priority Queue), Adjacency List",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V + E)",
      application: "Dispatches medical supply emergency shipments from Central Distribution Hubs to Hospitals along the minimum graph distance."
    },
    {
      name: "Prim's Algorithm",
      category: "Minimum Spanning Tree (Cut-based)",
      dataStructure: "Binary Min-Heap, Adjacency List",
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V + E)",
      application: "Determines the minimum road infrastructure required to maintain 100% medical connectivity across all hospitals without cycles."
    },
    {
      name: "Kruskal's Algorithm",
      category: "Minimum Spanning Tree (Edge-based)",
      dataStructure: "Disjoint Set Union (Path Compression & Union-by-Rank)",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V + E)",
      application: "Greedily connects medical clusters in ascending order of distance, verifying identical minimum weight parity with Prim's."
    },
    {
      name: "0/1 Knapsack (DP)",
      category: "Combinatorial Optimization",
      dataStructure: "2D Dynamic Programming Table (n+1) x (W+1)",
      timeComplexity: "O(n * W)",
      spaceComplexity: "O(n * W)",
      application: "Selects high-priority vaccine crates, oxygen cylinders, and trauma packs under vehicle payload capacity constraints."
    }
  ];

  const vivaQuestions = [
    {
      q: "Q1. Why does Dijkstra's distance differ from the OSRM road distance?",
      a: "Dijkstra operates purely on the discrete weighted graph stored in MySQL (where vertices represent medical facilities and edges represent known route segments). OSRM routes through the actual continuous OpenStreetMap road network, considering traffic flow, curves, turns, roundabouts, and elevation."
    },
    {
      q: "Q2. Why do Prim's and Kruskal's algorithms yield the exact same total weight?",
      a: "Both algorithms solve the exact same mathematical problem: finding a spanning tree with minimal total edge weight. In any connected weighted graph, the minimum total weight is invariant across all valid MSTs."
    },
    {
      q: "Q3. Why is 0/1 Knapsack solved using Dynamic Programming instead of a Greedy approach?",
      a: "A greedy approach (sorting by priority-to-weight ratio) is only optimal for the Fractional Knapsack problem where items can be divided. In 0/1 Knapsack, medical packages cannot be partially split; DP ensures that empty payload capacity is not wasted on sub-optimal items."
    },
    {
      q: "Q4. How is cycle detection handled in Kruskal's algorithm?",
      a: "Kruskal uses the Disjoint Set Union (DSU) data structure. When inspecting an edge (u, v), find(u) and find(v) are evaluated. If find(u) == find(v), both vertices are already connected, so the edge is skipped to avoid creating a cycle."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Project Master Overview: MedRoute
            </h3>
            <p className="text-xs text-slate-500">
              Master of Computer Applications (MCA) Mini Project • Specialization in Artificial Intelligence & Machine Learning
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          <strong>MedRoute</strong> is an intelligent medical supply distribution and route optimization system designed to demonstrate how foundational 
          <strong> Design and Analysis of Algorithms (DAA)</strong> principles solve life-critical healthcare logistics challenges. During medical crises, distributing blood units, vaccines, and emergency oxygen cylinders requires both optimal network connectivity and payload-constrained dispatch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <strong className="text-slate-900 block mb-1">Graph Representation:</strong>
            <p className="text-slate-600 leading-normal">
              Medical locations (Hospitals, Distribution Hubs) are modeled as vertices <code className="font-mono text-teal-700">V</code>; road connections are modeled as weighted undirected edges <code className="font-mono text-teal-700">E</code> with positive kilometer distances.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <strong className="text-slate-900 block mb-1">Dual Routing Engine:</strong>
            <p className="text-slate-600 leading-normal">
              MedRoute explicitly compares the stored discrete graph algorithm (<strong>Dijkstra</strong>) against real-world GIS road routing via the <strong>OSRM API</strong> and <strong>Leaflet OpenStreetMap</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <strong className="text-slate-900 block mb-1">Technology Stack:</strong>
            <p className="text-slate-600 leading-normal">
              Python 3.10+, Flask, PyMySQL, MySQL 8.x, Leaflet.js, OpenStreetMap tiles, high-precision timing benchmarks (<code className="font-mono text-indigo-700">time.perf_counter()</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Algorithms Comparative Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Cpu size={17} className="text-teal-600" />
          <span>DAA Implemented Algorithms Master Reference</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Problem Category</th>
                <th className="py-3 px-3">Primary Data Structures</th>
                <th className="py-3 px-3 text-teal-700">Time Complexity</th>
                <th className="py-3 px-3">Space Complexity</th>
                <th className="py-3 px-3">Healthcare Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {algorithmsSummary.map(algo => (
                <tr key={algo.name} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">{algo.name}</td>
                  <td className="py-3 px-3 text-slate-600">{algo.category}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{algo.dataStructure}</td>
                  <td className="py-3 px-3 font-mono font-bold text-teal-700">{algo.timeComplexity}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{algo.spaceComplexity}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">{algo.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viva Voce / Presentation Questions & Answers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle size={17} className="text-teal-600" />
          <span>Academic Viva Voce & Teacher Examination Questions</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vivaQuestions.map((vq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-xs text-blue-900">{vq.q}</div>
              <p className="text-slate-600 leading-relaxed">{vq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Limitations and Ethical Boundary */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5">
          <Info size={14} className="text-amber-700" />
          <span>Academic Demonstration Boundary</span>
        </div>
        <p className="leading-relaxed">
          This system is built as an educational MCA project for learning Design and Analysis of Algorithms. 
          Route estimates rely on demonstration APIs and static graph models; it should not be used as guaranteed live traffic navigation or for emergency dispatch life-and-death decisions.
        </p>
      </div>
    </div>
  );
};
