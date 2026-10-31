"""
Dijkstra's Shortest Path Algorithm
Academic Project: MedRoute (MCA Mini Project - DAA)

Purpose:
Find the shortest-distance path between two vertices in a weighted graph
with non-negative edge weights.

Time Complexity:
O((V + E) log V) using an adjacency list and binary min-heap (heapq).
Space Complexity:
O(V + E) for the adjacency list and distance/parent tracking.
"""

import heapq
from typing import Dict, List, Tuple, Optional, Any


def dijkstra_shortest_path(
    vertices: List[int],
    edges: List[Tuple[int, int, float]],
    source_id: int,
    destination_id: int
) -> Dict[str, Any]:
    """
    Executes Dijkstra's algorithm to compute the shortest path between
    source_id and destination_id on a weighted undirected graph.

    Parameters:
        vertices: List of vertex IDs (location IDs).
        edges: List of tuples (u, v, weight_km).
        source_id: Starting vertex ID.
        destination_id: Target vertex ID.

    Returns:
        dict containing:
            - found: bool
            - path: List of vertex IDs in order from source to destination
            - total_distance_km: float (rounded to 2 decimals)
            - visited_count: int
            - message: str explanation
    """
    # 1. Build adjacency list representation
    # graph[u] = list of (v, weight)
    graph: Dict[int, List[Tuple[int, float]]] = {v: [] for v in vertices}
    
    for u, v, w in edges:
        if u in graph and v in graph:
            # Undirected graph: add edge in both directions
            graph[u].append((v, float(w)))
            graph[v].append((u, float(w)))

    # Edge cases
    if source_id not in graph or destination_id not in graph:
        return {
            "found": False,
            "path": [],
            "total_distance_km": 0.0,
            "visited_count": 0,
            "message": "Source or destination vertex does not exist in graph."
        }

    if source_id == destination_id:
        return {
            "found": True,
            "path": [source_id],
            "total_distance_km": 0.0,
            "visited_count": 1,
            "message": "Source and destination are identical."
        }

    # 2. Initialize distances to infinity and parent pointers to None
    distances: Dict[int, float] = {v: float('inf') for v in vertices}
    parents: Dict[int, Optional[int]] = {v: None for v in vertices}
    distances[source_id] = 0.0

    # 3. Priority queue stores tuples of (current_distance, vertex_id)
    pq: List[Tuple[float, int]] = [(0.0, source_id)]
    visited = set()

    while pq:
        curr_dist, u = heapq.heappop(pq)

        # If already finalized with a shorter distance, skip
        if u in visited:
            continue
        visited.add(u)

        # Early termination if destination reached
        if u == destination_id:
            break

        # Relax adjacent edges
        for v, weight in graph.get(u, []):
            if v in visited:
                continue
            
            new_dist = curr_dist + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                parents[v] = u
                heapq.heappush(pq, (new_dist, v))

    # 4. Check if destination was reachable
    if distances[destination_id] == float('inf'):
        return {
            "found": False,
            "path": [],
            "total_distance_km": 0.0,
            "visited_count": len(visited),
            "message": f"No valid path exists between vertex {source_id} and {destination_id} in the medical network."
        }

    # 5. Reconstruct path from destination backwards to source
    path: List[int] = []
    curr: Optional[int] = destination_id
    while curr is not None:
        path.append(curr)
        curr = parents[curr]
    path.reverse()

    return {
        "found": True,
        "path": path,
        "total_distance_km": round(distances[destination_id], 2),
        "visited_count": len(visited),
        "message": f"Shortest path discovered with {len(path)} nodes and {distances[destination_id]:.2f} km total graph distance."
    }
