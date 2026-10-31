"""
Unit Tests for MedRoute DAA Algorithms
Academic Project: MedRoute (MCA Mini Project - DAA)

Tests:
1. Dijkstra's shortest path
2. Prim's Minimum Spanning Tree
3. Kruskal's Minimum Spanning Tree
4. Weight parity between Prim and Kruskal
5. 0/1 Knapsack dynamic programming
"""

import unittest
from medroute.algorithms.dijkstra import dijkstra_shortest_path
from medroute.algorithms.prim import prim_minimum_spanning_tree
from medroute.algorithms.kruskal import kruskal_minimum_spanning_tree
from medroute.algorithms.knapsack import knapsack_01_dp


class TestDijkstra(unittest.TestCase):
    def setUp(self):
        # Sample Medical Graph:
        # 1: Central Depot
        # 2: City Hospital
        # 3: Community Clinic
        # 4: Regional Medical Center
        # Edges: (1-2: 10km), (1-3: 15km), (2-3: 4km), (2-4: 12km), (3-4: 6km)
        self.vertices = [1, 2, 3, 4]
        self.edges = [
            (1, 2, 10.0),
            (1, 3, 15.0),
            (2, 3, 4.0),
            (2, 4, 12.0),
            (3, 4, 6.0)
        ]

    def test_shortest_path_standard(self):
        # Shortest from 1 to 4 should be 1 -> 2 -> 3 -> 4 (10 + 4 + 6 = 20)
        # Alternatively 1 -> 2 -> 4 is 22.
        # 1 -> 3 -> 4 is 15 + 6 = 21.
        # Shortest is indeed 1 -> 2 -> 3 -> 4 with cost 20.0
        res = dijkstra_shortest_path(self.vertices, self.edges, 1, 4)
        self.assertTrue(res["found"])
        self.assertEqual(res["path"], [1, 2, 3, 4])
        self.assertEqual(res["total_distance_km"], 20.0)

    def test_same_source_and_destination(self):
        res = dijkstra_shortest_path(self.vertices, self.edges, 2, 2)
        self.assertTrue(res["found"])
        self.assertEqual(res["path"], [2])
        self.assertEqual(res["total_distance_km"], 0.0)

    def test_unreachable_node(self):
        # Node 5 is isolated
        verts = [1, 2, 3, 4, 5]
        res = dijkstra_shortest_path(verts, self.edges, 1, 5)
        self.assertFalse(res["found"])
        self.assertEqual(res["path"], [])
        self.assertEqual(res["total_distance_km"], 0.0)

    def test_nonexistent_node(self):
        res = dijkstra_shortest_path(self.vertices, self.edges, 1, 999)
        self.assertFalse(res["found"])


class TestSpanningTrees(unittest.TestCase):
    def setUp(self):
        # 4 vertices, triangle with tail
        # 1-2: 1, 2-3: 2, 3-1: 3, 3-4: 4
        # MST should pick (1-2: 1), (2-3: 2), (3-4: 4), total weight = 7.0
        self.vertices = [1, 2, 3, 4]
        self.edges = [
            (1, 2, 1.0),
            (2, 3, 2.0),
            (3, 1, 3.0),
            (3, 4, 4.0)
        ]

    def test_prim_mst(self):
        res = prim_minimum_spanning_tree(self.vertices, self.edges)
        self.assertTrue(res["is_connected"])
        self.assertEqual(res["total_mst_distance_km"], 7.0)
        self.assertEqual(res["edge_count"], 3)

    def test_kruskal_mst(self):
        res = kruskal_minimum_spanning_tree(self.vertices, self.edges)
        self.assertTrue(res["is_connected"])
        self.assertEqual(res["total_mst_distance_km"], 7.0)
        self.assertEqual(res["edge_count"], 3)

    def test_prim_and_kruskal_produce_same_total_weight(self):
        # Compare on a larger graph
        v = [1, 2, 3, 4, 5, 6]
        e = [
            (1, 2, 4.0), (1, 3, 2.0),
            (2, 3, 1.0), (2, 4, 5.0),
            (3, 4, 8.0), (3, 5, 10.0),
            (4, 5, 2.0), (4, 6, 6.0),
            (5, 6, 3.0)
        ]
        prim_res = prim_minimum_spanning_tree(v, e)
        kruskal_res = kruskal_minimum_spanning_tree(v, e)
        self.assertTrue(prim_res["is_connected"])
        self.assertTrue(kruskal_res["is_connected"])
        self.assertEqual(prim_res["total_mst_distance_km"], kruskal_res["total_mst_distance_km"])

    def test_disconnected_graph(self):
        v = [1, 2, 3, 4]
        e = [(1, 2, 5.0), (3, 4, 6.0)]
        prim_res = prim_minimum_spanning_tree(v, e)
        kruskal_res = kruskal_minimum_spanning_tree(v, e)
        self.assertFalse(prim_res["is_connected"])
        self.assertFalse(kruskal_res["is_connected"])


class TestKnapsack(unittest.TestCase):
    def setUp(self):
        self.items = [
            {"id": 1, "name": "Emergency Oxygen Cylinders", "weight": 10, "priority_value": 60},
            {"id": 2, "name": "Critical Vaccines", "weight": 20, "priority_value": 100},
            {"id": 3, "name": "Trauma Blood Units", "weight": 30, "priority_value": 120},
            {"id": 4, "name": "First Aid Kits", "weight": 5, "priority_value": 30}
        ]

    def test_knapsack_optimal(self):
        # Capacity = 50
        # Possible selections:
        # Items 2 + 3: weight 50, value 220
        # Items 1 + 2 + 4: weight 35, value 190
        # Items 1 + 3 + 4: weight 45, value 210
        # Items 2 + 3 is max value 220
        res = knapsack_01_dp(self.items, 50)
        self.assertEqual(res["max_priority_value"], 220)
        self.assertLessEqual(res["total_weight_used"], 50)
        selected_names = [i["name"] for i in res["selected_items"]]
        self.assertIn("Critical Vaccines", selected_names)
        self.assertIn("Trauma Blood Units", selected_names)

    def test_knapsack_small_capacity(self):
        # Capacity = 8 -> only First Aid Kits (weight 5) fits
        res = knapsack_01_dp(self.items, 8)
        self.assertEqual(res["max_priority_value"], 30)
        self.assertEqual(res["total_weight_used"], 5)
        self.assertEqual(len(res["selected_items"]), 1)

    def test_knapsack_zero_capacity(self):
        res = knapsack_01_dp(self.items, 0)
        self.assertEqual(res["max_priority_value"], 0)
        self.assertEqual(res["total_weight_used"], 0)
        self.assertEqual(len(res["selected_items"]), 0)


if __name__ == "__main__":
    unittest.main()
