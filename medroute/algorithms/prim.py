"""
Prim's Minimum Spanning Tree (MST) Algorithm
Academic Project: MedRoute (MCA Mini Project - DAA)

Purpose:
Connect all reachable vertices in the medical distribution network with the
minimum possible total road connection distance without creating any cycles.

Time Complexity:
O(E log V) using an adjacency list and binary min-heap (heapq).
Space Complexity:
O(V + E) for the adjacency list, heap, and visited set.
"""

import heapq
from typing import Dict, List, Tuple, Any


def prim_minimum_spanning_tree(
    vertices: List[int],
    edges: List[Tuple[int, int, float]],
    start_vertex_id: int = None
) -> Dict[str, Any]:
    """
    Executes Prim's algorithm to compute the Minimum Spanning Tree (MST).

    Parameters:
        vertices: List of vertex IDs.
        edges: List of tuples (u, v, weight_km).
        start_vertex_id: Optional vertex to start growing the tree from.
                         Defaults to the first vertex in vertices list.

    Returns:
        dict containing:
            - is_connected: bool (True if all vertices are in 1 connected component)
            - total_mst_distance_km: float
            - selected_edges: List of dicts [{"source": u, "destination": v, "distance_km": w}]
            - vertex_count: int
            - edge_count: int
            - message: str explanation
    """
    if not vertices:
        return {
            "is_connected": True,
            "total_mst_distance_km": 0.0,
            "selected_edges": [],
            "vertex_count": 0,
            "edge_count": 0,
            "message": "Graph is empty."
        }

    if len(vertices) == 1:
        return {
            "is_connected": True,
            "total_mst_distance_km": 0.0,
            "selected_edges": [],
            "vertex_count": 1,
            "edge_count": 0,
            "message": "Single vertex network requires 0 edges to span."
        }

    # 1. Build adjacency list
    graph: Dict[int, List[Tuple[int, float]]] = {v: [] for v in vertices}
    for u, v, w in edges:
        if u in graph and v in graph and u != v:
            graph[u].append((v, float(w)))
            graph[v].append((u, float(w)))

    # 2. Select initial vertex
    start = start_vertex_id if (start_vertex_id is not None and start_vertex_id in graph) else vertices[0]

    visited = set()
    selected_edges: List[Dict[str, Any]] = []
    total_weight = 0.0

    # Min-heap stores: (weight, from_vertex, to_vertex)
    min_heap: List[Tuple[float, int, int]] = []

    # Mark start vertex as visited and push its incident edges
    visited.add(start)
    for neighbor, weight in graph[start]:
        heapq.heappush(min_heap, (weight, start, neighbor))

    # 3. Grow tree by picking the minimum weight cut edge
    while min_heap and len(visited) < len(vertices):
        weight, u, v = heapq.heappop(min_heap)

        if v in visited:
            continue

        # Include vertex v and the edge (u, v) into MST
        visited.add(v)
        total_weight += weight
        selected_edges.append({
            "source": u,
            "destination": v,
            "distance_km": round(weight, 2)
        })

        # Add edges incident to newly visited vertex v
        for next_neighbor, next_weight in graph[v]:
            if next_neighbor not in visited:
                heapq.heappush(min_heap, (next_weight, v, next_neighbor))

    is_connected = (len(visited) == len(vertices))

    msg = (
        f"Prim's MST constructed successfully with {len(selected_edges)} edges "
        f"and total network weight {round(total_weight, 2)} km."
        if is_connected
        else f"Warning: Medical transportation network is disconnected! Spanned {len(visited)} of {len(vertices)} locations."
    )

    return {
        "is_connected": is_connected,
        "total_mst_distance_km": round(total_weight, 2),
        "selected_edges": selected_edges,
        "vertex_count": len(vertices),
        "spanned_vertices": len(visited),
        "edge_count": len(selected_edges),
        "message": msg
    }
