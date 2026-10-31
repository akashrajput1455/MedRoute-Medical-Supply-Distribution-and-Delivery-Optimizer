/**
 * Kruskal's Minimum Spanning Tree (MST) Algorithm
 * Design and Analysis of Algorithms (DAA)
 * 
 * Time Complexity: O(E log E) for edge sorting, nearly linear for DSU operations: O(E * α(V))
 * Space Complexity: O(V + E) for DSU structures and edge list
 */

import { MSTResult, MSTEdge } from '../types';

class DisjointSetUnion {
  private parent = new Map<number, number>();
  private rank = new Map<number, number>();

  constructor(elements: number[]) {
    for (const el of elements) {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    }
  }

  find(i: number): number {
    if (this.parent.get(i) !== i) {
      this.parent.set(i, this.find(this.parent.get(i)!)); // Path compression
    }
    return this.parent.get(i)!;
  }

  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI === rootJ) {
      return false; // Cycle detected
    }

    const rankI = this.rank.get(rootI) || 0;
    const rankJ = this.rank.get(rootJ) || 0;

    if (rankI < rankJ) {
      this.parent.set(rootI, rootJ);
    } else if (rankI > rankJ) {
      this.parent.set(rootJ, rootI);
    } else {
      this.parent.set(rootJ, rootI);
      this.rank.set(rootI, rankI + 1);
    }

    return true;
  }
}

export function kruskalMST(
  vertices: number[],
  edges: [number, number, number][] // [u, v, weightKm]
): MSTResult {
  const startTime = performance.now();

  if (vertices.length <= 1) {
    return {
      isConnected: true,
      totalMstDistanceKm: 0,
      selectedEdges: [],
      vertexCount: vertices.length,
      edgeCount: 0,
      message: 'Single location or empty graph requires 0 km spanning tree.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  // 1. Normalize and deduplicate undirected edges
  const edgeMap = new Map<string, { u: number; v: number; weight: number }>();
  for (const [u, v, w] of edges) {
    if (u === v || !vertices.includes(u) || !vertices.includes(v)) continue;
    const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (!edgeMap.has(key) || w < edgeMap.get(key)!.weight) {
      edgeMap.set(key, { u: Math.min(u, v), v: Math.max(u, v), weight: w });
    }
  }

  const sortedEdges = Array.from(edgeMap.values()).sort((a, b) => a.weight - b.weight);

  // 2. Disjoint Set Union
  const dsu = new DisjointSetUnion(vertices);
  const selectedEdges: MSTEdge[] = [];
  let totalWeight = 0;

  for (const edge of sortedEdges) {
    if (dsu.union(edge.u, edge.v)) {
      selectedEdges.push({
        source: edge.u,
        destination: edge.v,
        distanceKm: Number(edge.weight.toFixed(2))
      });
      totalWeight += edge.weight;

      if (selectedEdges.length === vertices.length - 1) {
        break; // A spanning tree on V vertices has exactly V - 1 edges
      }
    }
  }

  const isConnected = selectedEdges.length === vertices.length - 1;
  const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    isConnected,
    totalMstDistanceKm: Number(totalWeight.toFixed(2)),
    selectedEdges,
    vertexCount: vertices.length,
    edgeCount: selectedEdges.length,
    message: isConnected
      ? `Kruskal's MST selected ${selectedEdges.length} optimal edges with ${totalWeight.toFixed(2)} km total network distance.`
      : `Disconnected network: formed ${selectedEdges.length} edges among ${vertices.length} vertices.`,
    executionTimeMs
  };
}
