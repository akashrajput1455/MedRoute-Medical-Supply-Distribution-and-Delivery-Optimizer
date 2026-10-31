/**
 * Prim's Minimum Spanning Tree (MST) Algorithm
 * Design and Analysis of Algorithms (DAA)
 * 
 * Time Complexity: O(E log V) with binary min-heap
 * Space Complexity: O(V + E) for adjacency list and cut-edge queue
 */

import { MSTResult, MSTEdge } from '../types';

interface EdgeHeapNode {
  weight: number;
  u: number;
  v: number;
}

class EdgeMinHeap {
  private heap: EdgeHeapNode[] = [];

  push(node: EdgeHeapNode) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): EdgeHeapNode | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(idx: number) {
    const element = this.heap[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (element.weight >= parent.weight) break;
      this.heap[idx] = parent;
      this.heap[parentIdx] = element;
      idx = parentIdx;
    }
  }

  private sinkDown(idx: number) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let swap: number | null = null;
      let leftChild: EdgeHeapNode;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.weight < element.weight) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.weight < element.weight) ||
          (swap !== null && rightChild.weight < this.heap[swap].weight)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }
}

export function primMST(
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
      message: 'Network with 1 or 0 locations has trivial 0 km spanning tree.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  // 1. Build adjacency list
  const adj = new Map<number, { neighbor: number; weight: number }[]>();
  for (const v of vertices) {
    adj.set(v, []);
  }

  for (const [u, v, w] of edges) {
    if (adj.has(u) && adj.has(v) && u !== v) {
      adj.get(u)!.push({ neighbor: v, weight: w });
      adj.get(v)!.push({ neighbor: u, weight: w });
    }
  }

  const visited = new Set<number>();
  const selectedEdges: MSTEdge[] = [];
  let totalWeight = 0;

  const startVertex = vertices[0];
  visited.add(startVertex);

  const pq = new EdgeMinHeap();
  for (const edge of adj.get(startVertex) || []) {
    pq.push({ weight: edge.weight, u: startVertex, v: edge.neighbor });
  }

  while (!pq.isEmpty() && visited.size < vertices.length) {
    const { weight, u, v } = pq.pop()!;
    if (visited.has(v)) continue;

    visited.add(v);
    totalWeight += weight;
    selectedEdges.push({
      source: u,
      destination: v,
      distanceKm: Number(weight.toFixed(2))
    });

    for (const nextEdge of adj.get(v) || []) {
      if (!visited.has(nextEdge.neighbor)) {
        pq.push({ weight: nextEdge.weight, u: v, v: nextEdge.neighbor });
      }
    }
  }

  const isConnected = visited.size === vertices.length;
  const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    isConnected,
    totalMstDistanceKm: Number(totalWeight.toFixed(2)),
    selectedEdges,
    vertexCount: vertices.length,
    edgeCount: selectedEdges.length,
    message: isConnected
      ? `Prim's MST connected all ${vertices.length} locations with ${selectedEdges.length} edges and ${totalWeight.toFixed(2)} km total network distance.`
      : `Disconnected medical network: spanned ${visited.size} of ${vertices.length} locations.`,
    executionTimeMs
  };
}
