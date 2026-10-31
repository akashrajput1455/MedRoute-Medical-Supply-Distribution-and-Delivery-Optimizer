/**
 * Benchmark Suite for MedRoute DAA Algorithms
 * Generates synthetic graphs and measures high-precision execution times.
 */

import { BenchmarkItem, SupplyItem } from '../types';
import { dijkstraShortestPath } from './dijkstra';
import { primMST } from './prim';
import { kruskalMST } from './kruskal';
import { knapsack01DP } from './knapsack';

function generateConnectedGraph(numVertices: number, extraEdges: number): {
  vertices: number[];
  edges: [number, number, number][];
} {
  const vertices = Array.from({ length: numVertices }, (_, i) => i + 1);
  const edges: [number, number, number][] = [];
  const connected = new Set<number>([vertices[0]]);
  const unconnected = new Set<number>(vertices.slice(1));

  // Pseudo-random helper with seed
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Build spanning tree for guaranteed connectivity
  while (unconnected.size > 0) {
    const connArr = Array.from(connected);
    const unconnArr = Array.from(unconnected);
    const u = connArr[Math.floor(rand() * connArr.length)];
    const v = unconnArr[Math.floor(rand() * unconnArr.length)];
    const w = Number((2.5 + rand() * 30).toFixed(2));
    edges.push([u, v, w]);
    connected.add(v);
    unconnected.delete(v);
  }

  // Add extra random edges
  const edgeKeys = new Set(edges.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`));
  let attempts = 0;
  while (edges.length < numVertices - 1 + extraEdges && attempts < 400) {
    attempts++;
    const u = vertices[Math.floor(rand() * vertices.length)];
    const v = vertices[Math.floor(rand() * vertices.length)];
    if (u !== v) {
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        const w = Number((3.0 + rand() * 40).toFixed(2));
        edges.push([u, v, w]);
      }
    }
  }

  return { vertices, edges };
}

function generateSupplyItems(count: number): SupplyItem[] {
  let seed = 88;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const names = ['Vaccine Pack', 'Oxygen Cylinder', 'Trauma Kit', 'Antibiotic Infusion', 'Surgical Bundle', 'Blood Unit'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[Math.floor(rand() * names.length)]} #${i + 1}`,
    weight: Math.floor(2 + rand() * 25),
    priorityValue: Math.floor(15 + rand() * 85)
  }));
}

export function runLiveBenchmark(): BenchmarkItem[] {
  const configs = [
    { scale: 'Small', vertices: 8, extraEdges: 6, items: 10, capacity: 50 },
    { scale: 'Medium', vertices: 25, extraEdges: 35, items: 40, capacity: 150 },
    { scale: 'Large', vertices: 75, extraEdges: 140, items: 100, capacity: 300 }
  ];

  const results: BenchmarkItem[] = [];

  for (const cfg of configs) {
    const { vertices, edges } = generateConnectedGraph(cfg.vertices, cfg.extraEdges);
    const items = generateSupplyItems(cfg.items);
    const src = vertices[0];
    const dst = vertices[vertices.length - 1];

    const runs = 10;

    // 1. Dijkstra
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) {
      dijkstraShortestPath(vertices, edges, src, dst);
    }
    const dijkstraMs = Number(((performance.now() - t0) / runs).toFixed(3));

    // 2. Prim
    const t1 = performance.now();
    let primRes = primMST(vertices, edges);
    for (let i = 0; i < runs - 1; i++) {
      primRes = primMST(vertices, edges);
    }
    const primMs = Number(((performance.now() - t1) / runs).toFixed(3));

    // 3. Kruskal
    const t2 = performance.now();
    let kruskalRes = kruskalMST(vertices, edges);
    for (let i = 0; i < runs - 1; i++) {
      kruskalRes = kruskalMST(vertices, edges);
    }
    const kruskalMs = Number(((performance.now() - t2) / runs).toFixed(3));

    // 4. Knapsack
    const t3 = performance.now();
    for (let i = 0; i < runs; i++) {
      knapsack01DP(items, cfg.capacity);
    }
    const knapsackMs = Number(((performance.now() - t3) / runs).toFixed(3));

    results.push({
      scale: cfg.scale,
      graphVertices: vertices.length,
      graphEdges: edges.length,
      knapsackItems: items.length,
      knapsackCapacity: cfg.capacity,
      dijkstraMs,
      primMs,
      kruskalMs,
      knapsackMs,
      mstWeightPrim: primRes.totalMstDistanceKm,
      mstWeightKruskal: kruskalRes.totalMstDistanceKm
    });
  }

  return results;
}
