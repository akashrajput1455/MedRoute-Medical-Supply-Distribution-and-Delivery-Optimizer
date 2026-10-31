/**
 * Dijkstra's Shortest Path Algorithm
 * Design and Analysis of Algorithms (DAA)
 * 
 * Time Complexity: O((V + E) log V) with binary min-heap
 * Space Complexity: O(V + E) for adjacency list and priority queue
 */

import { DijkstraResult } from '../types';

interface HeapNode {
  vertex: number;
  distance: number;
}

class MinHeap {
  private heap: HeapNode[] = [];

  push(node: HeapNode) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): HeapNode | undefined {
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
      if (element.distance >= parent.distance) break;
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
      let leftChild: HeapNode;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.distance < element.distance) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.distance < element.distance) ||
          (swap !== null && rightChild.distance < this.heap[swap].distance)
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

export function dijkstraShortestPath(
  vertices: number[],
  edges: [number, number, number][], // [u, v, weightKm]
  sourceId: number,
  destinationId: number
): DijkstraResult {
  const startTime = performance.now();

  // 1. Build adjacency list representation
  const graph = new Map<number, { neighbor: number; weight: number }[]>();
  for (const v of vertices) {
    graph.set(v, []);
  }

  for (const [u, v, w] of edges) {
    if (graph.has(u) && graph.has(v)) {
      graph.get(u)!.push({ neighbor: v, weight: w });
      graph.get(v)!.push({ neighbor: u, weight: w }); // Undirected
    }
  }

  // Edge cases
  if (!graph.has(sourceId) || !graph.has(destinationId)) {
    return {
      found: false,
      path: [],
      totalDistanceKm: 0,
      visitedCount: 0,
      message: 'Source or destination location is not present in the graph.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  if (sourceId === destinationId) {
    return {
      found: true,
      path: [sourceId],
      totalDistanceKm: 0,
      visitedCount: 1,
      message: 'Source and destination are the exact same location.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  // 2. Initialize distances & parent pointers
  const distances = new Map<number, number>();
  const parents = new Map<number, number | null>();
  const visited = new Set<number>();

  for (const v of vertices) {
    distances.set(v, Infinity);
    parents.set(v, null);
  }

  distances.set(sourceId, 0);

  // 3. Priority queue
  const pq = new MinHeap();
  pq.push({ vertex: sourceId, distance: 0 });

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    const u = current.vertex;

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === destinationId) break; // Reached target

    for (const edge of graph.get(u) || []) {
      const v = edge.neighbor;
      if (visited.has(v)) continue;

      const newDist = distances.get(u)! + edge.weight;
      if (newDist < distances.get(v)!) {
        distances.set(v, newDist);
        parents.set(v, u);
        pq.push({ vertex: v, distance: newDist });
      }
    }
  }

  const destDist = distances.get(destinationId)!;
  if (destDist === Infinity) {
    return {
      found: false,
      path: [],
      totalDistanceKm: 0,
      visitedCount: visited.size,
      message: 'No road connection or graph path exists between the selected medical locations.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  // 4. Reconstruct path
  const path: number[] = [];
  let curr: number | null = destinationId;
  while (curr !== null) {
    path.push(curr);
    curr = parents.get(curr) ?? null;
  }
  path.reverse();

  const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    found: true,
    path,
    totalDistanceKm: Number(destDist.toFixed(2)),
    visitedCount: visited.size,
    message: `Shortest graph route found: ${path.length} hops, ${destDist.toFixed(2)} km.`,
    executionTimeMs
  };
}
