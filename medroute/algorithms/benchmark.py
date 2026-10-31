"""
Performance Benchmarking Suite for DAA Algorithms
Academic Project: MedRoute (MCA Mini Project - DAA)

Measures real execution times of all 4 implemented algorithms using high-resolution
time.perf_counter() over varying dataset scales (Small, Medium, Large).
"""

import time
import random
from typing import Dict, List, Tuple, Any

from .dijkstra import dijkstra_shortest_path
from .prim import prim_minimum_spanning_tree
from .kruskal import kruskal_minimum_spanning_tree
from .knapsack import knapsack_01_dp


def generate_connected_graph(num_vertices: int, extra_edges: int = 5) -> Tuple[List[int], List[Tuple[int, int, float]]]:
    """Generates a random connected graph with specified vertices and edge density."""
    vertices = list(range(1, num_vertices + 1))
    edges: List[Tuple[int, int, float]] = []
    connected = {vertices[0]}
    unconnected = set(vertices[1:])

    rng = random.Random(42)  # Seed for reproducibility

    # Build initial spanning tree to guarantee connectivity
    while unconnected:
        u = rng.choice(list(connected))
        v = rng.choice(list(unconnected))
        w = round(rng.uniform(2.0, 35.0), 2)
        edges.append((u, v, w))
        connected.add(v)
        unconnected.remove(v)

    # Add extra random edges
    existing_pairs = set((min(u, v), max(u, v)) for u, v, _ in edges)
    attempts = 0
    while len(edges) < (num_vertices - 1 + extra_edges) and attempts < 300:
        attempts += 1
        u = rng.choice(vertices)
        v = rng.choice(vertices)
        if u != v:
            pair = (min(u, v), max(u, v))
            if pair not in existing_pairs:
                existing_pairs.add(pair)
                w = round(rng.uniform(3.0, 45.0), 2)
                edges.append((u, v, w))

    return vertices, edges


def generate_knapsack_items(num_items: int) -> List[Dict[str, Any]]:
    """Generates random medical supply items with realistic weights and priority scores."""
    rng = random.Random(101)
    medical_prefixes = ["Vaccine Crate", "Oxygen Cylinder", "PPE Box", "Antibiotic Kit", "Trauma Pack", "Surgical Kit"]
    items = []
    for i in range(1, num_items + 1):
        name = f"{rng.choice(medical_prefixes)} #{i}"
        weight = rng.randint(2, 30)
        priority = rng.randint(10, 100)
        items.append({"id": i, "name": name, "weight": weight, "priority_value": priority})
    return items


def run_benchmark_suite() -> Dict[str, Any]:
    """
    Executes real-time benchmarking across Small, Medium, and Large scales.
    Returns structured results for presentation and chart rendering.
    """
    scales = {
        "Small": {"vertices": 8, "extra_edges": 6, "items": 10, "capacity": 60},
        "Medium": {"vertices": 25, "extra_edges": 30, "items": 40, "capacity": 150},
        "Large": {"vertices": 70, "extra_edges": 120, "items": 100, "capacity": 300}
    }

    results = []

    for scale_name, params in scales.items():
        v_list, edge_list = generate_connected_graph(params["vertices"], params["extra_edges"])
        items = generate_knapsack_items(params["items"])
        src, dst = v_list[0], v_list[-1]
        cap = params["capacity"]

        # 1. Dijkstra
        runs = 5
        start_t = time.perf_counter()
        for _ in range(runs):
            dijkstra_res = dijkstra_shortest_path(v_list, edge_list, src, dst)
        dijkstra_time_ms = ((time.perf_counter() - start_t) / runs) * 1000

        # 2. Prim's MST
        start_t = time.perf_counter()
        for _ in range(runs):
            prim_res = prim_minimum_spanning_tree(v_list, edge_list)
        prim_time_ms = ((time.perf_counter() - start_t) / runs) * 1000

        # 3. Kruskal's MST
        start_t = time.perf_counter()
        for _ in range(runs):
            kruskal_res = kruskal_minimum_spanning_tree(v_list, edge_list)
        kruskal_time_ms = ((time.perf_counter() - start_t) / runs) * 1000

        # 4. 0/1 Knapsack
        start_t = time.perf_counter()
        for _ in range(runs):
            knapsack_res = knapsack_01_dp(items, cap)
        knapsack_time_ms = ((time.perf_counter() - start_t) / runs) * 1000

        results.append({
            "scale": scale_name,
            "graph_vertices": len(v_list),
            "graph_edges": len(edge_list),
            "knapsack_items": len(items),
            "knapsack_capacity": cap,
            "dijkstra_ms": round(dijkstra_time_ms, 4),
            "prim_ms": round(prim_time_ms, 4),
            "kruskal_ms": round(kruskal_time_ms, 4),
            "knapsack_ms": round(knapsack_time_ms, 4),
            "mst_weight_prim": prim_res["total_mst_distance_km"],
            "mst_weight_kruskal": kruskal_res["total_mst_distance_km"]
        })

    return {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "benchmarks": results,
        "complexity_reference": [
            {
                "algorithm": "Dijkstra's Shortest Path",
                "problem": "Single-Source Shortest Path",
                "time_complexity": "O((V + E) log V)",
                "space_complexity": "O(V + E)",
                "data_structures": "Min-Heap (Priority Queue), Adjacency List"
            },
            {
                "algorithm": "Prim's MST",
                "problem": "Minimum Spanning Tree (Cut-based)",
                "time_complexity": "O(E log V)",
                "space_complexity": "O(V + E)",
                "data_structures": "Binary Min-Heap, Adjacency List"
            },
            {
                "algorithm": "Kruskal's MST",
                "problem": "Minimum Spanning Tree (Edge-based)",
                "time_complexity": "O(E log E) or O(E log V)",
                "space_complexity": "O(V + E)",
                "data_structures": "Disjoint Set Union (Path Compression & Rank)"
            },
            {
                "algorithm": "0/1 Knapsack (DP)",
                "problem": "Capacity-Constrained Value Maximization",
                "time_complexity": "O(n * W)",
                "space_complexity": "O(n * W)",
                "data_structures": "2D Dynamic Programming Matrix"
            }
        ]
    }


if __name__ == "__main__":
    report = run_benchmark_suite()
    print("DAA Benchmark Suite Completed:")
    for b in report["benchmarks"]:
        print(f"Scale: {b['scale']} (V={b['graph_vertices']}, E={b['graph_edges']}, N={b['knapsack_items']})")
        print(f"  Dijkstra: {b['dijkstra_ms']} ms")
        print(f"  Prim MST: {b['prim_ms']} ms (Weight: {b['mst_weight_prim']} km)")
        print(f"  Kruskal MST: {b['kruskal_ms']} ms (Weight: {b['mst_weight_kruskal']} km)")
        print(f"  Knapsack DP: {b['knapsack_ms']} ms")
