"""
Kruskal's Minimum Spanning Tree (MST) Algorithm
Academic Project: MedRoute (MCA Mini Project - DAA)

Purpose:
Find the Minimum Spanning Tree of the medical logistics network by sorting
all connections by distance and greedily selecting edges that do not form a cycle.

Data Structure:
Disjoint Set Union (DSU / Union-Find) with:
1. Path Compression: Flattens the tree during find() for near O(1) amortized lookup.
2. Union by Rank: Attaches shallower tree to deeper tree to maintain optimal height.

Time Complexity:
O(E log E) for sorting edges, where E is the number of edges.
DSU operations take almost linear time: O(E * α(V)) where α is the Inverse Ackermann function.
Space Complexity:
O(V + E) for the DSU parent and rank tables and selected edge collection.
"""

from typing import Dict, List, Tuple, Any


class DisjointSetUnion:
    """Disjoint Set Union (Union-Find) with Path Compression and Union by Rank."""

    def __init__(self, elements: List[int]):
        # parent[i] points to parent of i; self initially
        self.parent: Dict[int, int] = {x: x for x in elements}
        # rank[i] approximates tree height
        self.rank: Dict[int, int] = {x: 0 for x in elements}
        self.num_sets: int = len(elements)

    def find(self, i: int) -> int:
        """Finds representative of set containing element i with path compression."""
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i: int, j: int) -> bool:
        """
        Merges sets containing i and j using union by rank.
        Returns True if sets were merged, False if already in same set (cycle detected).
        """
        root_i = self.find(i)
        root_j = self.find(j)

        if root_i == root_j:
            return False  # Same set, edge would create a cycle

        # Attach smaller rank tree under root of higher rank tree
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1

        self.num_sets -= 1
        return True


def kruskal_minimum_spanning_tree(
    vertices: List[int],
    edges: List[Tuple[int, int, float]]
) -> Dict[str, Any]:
    """
    Executes Kruskal's algorithm to compute the Minimum Spanning Tree (MST).

    Parameters:
        vertices: List of vertex IDs.
        edges: List of tuples (u, v, weight_km).

    Returns:
        dict containing:
            - is_connected: bool
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
            "message": "Graph has no locations."
        }

    if len(vertices) == 1:
        return {
            "is_connected": True,
            "total_mst_distance_km": 0.0,
            "selected_edges": [],
            "vertex_count": 1,
            "edge_count": 0,
            "message": "Single location spans itself with 0 km."
        }

    # 1. Normalize and deduplicate edges for sorting
    # Maintain (weight, min(u,v), max(u,v))
    dedup_edges = {}
    for u, v, w in edges:
        if u == v or u not in vertices or v not in vertices:
            continue
        key = (min(u, v), max(u, v))
        if key not in dedup_edges or w < dedup_edges[key]:
            dedup_edges[key] = float(w)

    # Convert to list of (weight, u, v)
    edge_list = [(weight, u, v) for (u, v), weight in dedup_edges.items()]

    # 2. Sort edges in non-decreasing order of weight (distance)
    edge_list.sort(key=lambda x: x[0])

    # 3. Initialize Disjoint Set Union
    dsu = DisjointSetUnion(vertices)

    selected_edges: List[Dict[str, Any]] = []
    total_weight = 0.0

    # 4. Greedily process each edge
    for weight, u, v in edge_list:
        # If u and v belong to different components, union them
        if dsu.union(u, v):
            selected_edges.append({
                "source": u,
                "destination": v,
                "distance_km": round(weight, 2)
            })
            total_weight += weight

            # An MST on V vertices has exactly V - 1 edges
            if len(selected_edges) == len(vertices) - 1:
                break

    is_connected = (len(selected_edges) == len(vertices) - 1)

    msg = (
        f"Kruskal's MST constructed successfully with {len(selected_edges)} edges "
        f"and total network weight {round(total_weight, 2)} km."
        if is_connected
        else f"Warning: Medical transportation network is disconnected! Selected {len(selected_edges)} edges among {len(vertices)} locations."
    )

    return {
        "is_connected": is_connected,
        "total_mst_distance_km": round(total_weight, 2),
        "selected_edges": selected_edges,
        "vertex_count": len(vertices),
        "edge_count": len(selected_edges),
        "message": msg
    }
