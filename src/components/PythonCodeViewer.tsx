/**
 * Python Backend & SQL Code Viewer Component for MedRoute
 * Allows students and examiners to inspect the Python algorithm implementations,
 * Flask app routes, and MySQL schema directly in the browser during presentations.
 */

import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, ExternalLink, Terminal } from 'lucide-react';

interface CodeFile {
  name: string;
  category: 'Algorithms' | 'Services' | 'Database' | 'Server' | 'Tests';
  language: 'python' | 'sql';
  code: string;
  description: string;
}

const CODE_FILES: CodeFile[] = [
  {
    name: 'dijkstra.py',
    category: 'Algorithms',
    language: 'python',
    description: "Dijkstra's Shortest Path on weighted graph using heapq (Priority Queue). Time: O((V+E) log V)",
    code: `import heapq
from typing import Dict, List, Tuple, Optional, Any

def dijkstra_shortest_path(
    vertices: List[int],
    edges: List[Tuple[int, int, float]],
    source_id: int,
    destination_id: int
) -> Dict[str, Any]:
    # 1. Build adjacency list: graph[u] = [(v, weight), ...]
    graph: Dict[int, List[Tuple[int, float]]] = {v: [] for v in vertices}
    for u, v, w in edges:
        if u in graph and v in graph:
            graph[u].append((v, float(w)))
            graph[v].append((u, float(w)))

    if source_id not in graph or destination_id not in graph:
        return {"found": False, "path": [], "total_distance_km": 0.0}

    # 2. Distances table and parents tracking
    distances: Dict[int, float] = {v: float('inf') for v in vertices}
    parents: Dict[int, Optional[int]] = {v: None for v in vertices}
    distances[source_id] = 0.0

    # 3. Min-Heap Priority Queue: (distance, vertex)
    pq: List[Tuple[float, int]] = [(0.0, source_id)]
    visited = set()

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        if u == destination_id:
            break

        for v, weight in graph.get(u, []):
            if v in visited:
                continue
            new_dist = curr_dist + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                parents[v] = u
                heapq.heappush(pq, (new_dist, v))

    if distances[destination_id] == float('inf'):
        return {"found": False, "path": [], "total_distance_km": 0.0}

    # 4. Path reconstruction
    path = []
    curr = destination_id
    while curr is not None:
        path.append(curr)
        curr = parents[curr]
    path.reverse()

    return {
        "found": True,
        "path": path,
        "total_distance_km": round(distances[destination_id], 2),
        "visited_count": len(visited)
    }`
  },
  {
    name: 'prim.py',
    category: 'Algorithms',
    language: 'python',
    description: "Prim's Minimum Spanning Tree using adjacency list and binary min-heap. Time: O(E log V)",
    code: `import heapq
from typing import Dict, List, Tuple, Any

def prim_minimum_spanning_tree(
    vertices: List[int],
    edges: List[Tuple[int, int, float]]
) -> Dict[str, Any]:
    if len(vertices) <= 1:
        return {"is_connected": True, "total_mst_distance_km": 0.0, "selected_edges": []}

    # 1. Adjacency list
    graph: Dict[int, List[Tuple[int, float]]] = {v: [] for v in vertices}
    for u, v, w in edges:
        if u in graph and v in graph and u != v:
            graph[u].append((v, float(w)))
            graph[v].append((u, float(w)))

    visited = set()
    selected_edges = []
    total_weight = 0.0

    # 2. Start from first vertex and push incident cut edges
    start = vertices[0]
    visited.add(start)
    min_heap = []
    for neighbor, weight in graph[start]:
        heapq.heappush(min_heap, (weight, start, neighbor))

    # 3. Greedy selection of minimum weight cut edge
    while min_heap and len(visited) < len(vertices):
        weight, u, v = heapq.heappop(min_heap)
        if v in visited:
            continue
        visited.add(v)
        total_weight += weight
        selected_edges.append({"source": u, "destination": v, "distance_km": round(weight, 2)})

        for next_neighbor, next_w in graph[v]:
            if next_neighbor not in visited:
                heapq.heappush(min_heap, (next_w, v, next_neighbor))

    is_connected = len(visited) == len(vertices)
    return {
        "is_connected": is_connected,
        "total_mst_distance_km": round(total_weight, 2),
        "selected_edges": selected_edges,
        "edge_count": len(selected_edges)
    }`
  },
  {
    name: 'kruskal.py',
    category: 'Algorithms',
    language: 'python',
    description: "Kruskal's Minimum Spanning Tree with Disjoint Set Union (Path Compression & Rank). Time: O(E log E)",
    code: `class DisjointSetUnion:
    def __init__(self, elements):
        self.parent = {x: x for x in elements}
        self.rank = {x: 0 for x in elements}

    def find(self, i):
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])  # Path compression
        return self.parent[i]

    def union(self, i, j):
        root_i, root_j = self.find(i), self.find(j)
        if root_i == root_j:
            return False  # Same set, cycle detected
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
        return True

def kruskal_minimum_spanning_tree(vertices, edges):
    # Sort edges by weight
    sorted_edges = sorted(edges, key=lambda x: x[2])
    dsu = DisjointSetUnion(vertices)
    selected_edges = []
    total_weight = 0.0

    for u, v, w in sorted_edges:
        if dsu.union(u, v):
            selected_edges.append({"source": u, "destination": v, "distance_km": round(w, 2)})
            total_weight += w
            if len(selected_edges) == len(vertices) - 1:
                break

    return {
        "is_connected": len(selected_edges) == len(vertices) - 1,
        "total_mst_distance_km": round(total_weight, 2),
        "selected_edges": selected_edges
    }`
  },
  {
    name: 'knapsack.py',
    category: 'Algorithms',
    language: 'python',
    description: "0/1 Knapsack Dynamic Programming for vehicle payload optimization. Time: O(n * W)",
    code: `def knapsack_01_dp(items, capacity):
    W = int(capacity)
    valid_items = [it for it in items if it.get("weight", 0) > 0]
    n = len(valid_items)

    # 1. 2D DP Table (n + 1) x (W + 1)
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    # 2. Fill DP table iteratively
    for i in range(1, n + 1):
        item_w = valid_items[i - 1]["weight"]
        item_p = valid_items[i - 1]["priority_value"]
        for w in range(1, W + 1):
            if item_w > w:
                dp[i][w] = dp[i - 1][w]
            else:
                dp[i][w] = max(dp[i - 1][w], item_p + dp[i - 1][w - item_w])

    max_priority = dp[n][W]

    # 3. Backtrack selected items
    selected_items, unselected_items = [], []
    curr_w = W
    for i in range(n, 0, -1):
        if dp[i][curr_w] != dp[i - 1][curr_w]:
            selected_items.append(valid_items[i - 1])
            curr_w -= valid_items[i - 1]["weight"]
        else:
            unselected_items.append(valid_items[i - 1])

    selected_items.reverse()
    total_weight = sum(x["weight"] for x in selected_items)

    return {
        "max_priority_value": max_priority,
        "total_weight_used": total_weight,
        "capacity": W,
        "selected_items": selected_items,
        "unselected_items": unselected_items
    }`
  },
  {
    name: 'schema.sql',
    category: 'Database',
    language: 'sql',
    description: 'MySQL 8.x schema with medical_locations, routes, supply_items, and route_history tables',
    code: `CREATE DATABASE IF NOT EXISTS medroute_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medroute_db;

CREATE TABLE medical_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location_type ENUM('Hospital', 'Distribution Center') NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_number VARCHAR(25) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_location_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE supply_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    weight INT NOT NULL,
    priority_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE route_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_location_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    algorithm_name VARCHAR(50) DEFAULT 'Dijkstra + OSRM',
    graph_distance_km DECIMAL(6, 2) NULL,
    road_distance_km DECIMAL(6, 2) NULL,
    estimated_duration_minutes DECIMAL(6, 1) NULL,
    route_status ENUM('Success', 'No Graph Path', 'OSRM Error', 'Failed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;`
  },
  {
    name: 'app.py',
    category: 'Server',
    language: 'python',
    description: 'Main Flask backend application with Jinja2 views and REST endpoints for DAA algorithms',
    code: `from flask import Flask, render_template, request, jsonify
from medroute.config import Config
from medroute.database.db import db_manager
from medroute.algorithms.dijkstra import dijkstra_shortest_path
from medroute.algorithms.prim import prim_minimum_spanning_tree
from medroute.algorithms.kruskal import kruskal_minimum_spanning_tree
from medroute.algorithms.knapsack import knapsack_01_dp
from medroute.services.routing_service import RoutingService

app = Flask(__name__)
routing_service = RoutingService()

@app.route("/")
def dashboard():
    return render_template("dashboard.html", locations=db_manager.get_all_locations())

@app.route("/api/plan-route", methods=["POST"])
def plan_route():
    data = request.json
    src, dst = int(data["source_id"]), int(data["dest_id"])
    graph = db_manager.get_graph_data()
    dijkstra = dijkstra_shortest_path(graph["vertices"], graph["edges"], src, dst)
    return jsonify({"dijkstra": dijkstra})

if __name__ == "__main__":
    app.run(port=5000, debug=True)`
  }
];

export const PythonCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Terminal size={17} className="text-teal-600" />
            <span>Python Source Code & MySQL Database Explorer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified, manually implemented DAA algorithm modules and database schema ready for Windows execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Main File Browser & Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar File List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Project Modules
          </div>
          {CODE_FILES.map(file => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                selectedFile.name === file.name
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode size={15} className={selectedFile.name === file.name ? 'text-teal-600' : 'text-slate-400'} />
                <span className="truncate">{file.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                {file.language}
              </span>
            </button>
          ))}

          <div className="mt-4 pt-3 border-t border-slate-100 px-2 text-[11px] text-slate-400 leading-tight">
            All files are available inside the <code className="font-mono text-slate-600">/medroute</code> folder in this workspace.
          </div>
        </div>

        {/* Code Display Area */}
        <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col justify-between">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-teal-400">{selectedFile.name}</span>
              <span className="text-slate-400 ml-2">({selectedFile.description})</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              {selectedFile.language.toUpperCase()}
            </span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto overflow-y-auto max-h-[540px] leading-relaxed">
            <code>{selectedFile.code}</code>
          </pre>

          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Unit tests verified with Python standard library.</span>
            <span className="text-emerald-400 font-semibold">Ready for Windows 10/11 & MySQL 8.x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
