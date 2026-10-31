# Academic Mini Project Report

# MEDROUTE: AN INTELLIGENT MEDICAL SUPPLY DISTRIBUTION AND ROUTE OPTIMIZATION SYSTEM

**Program**: Master of Computer Applications (MCA)  
**Specialization**: Artificial Intelligence and Machine Learning  
**Subject**: Design and Analysis of Algorithms (DAA)  

---

## 1. Introduction

Emergency healthcare logistics involves the delivery of critical medical equipment, vaccines, whole blood units, and pharmaceuticals between centralized medical depots and regional hospital clusters. In emergency and disaster conditions, distribution networks face two major challenges:
1. Identifying the optimal route connecting hubs and clinics through complex road topologies.
2. Loading transport vehicles whose payload weight is strictly constrained so that maximum medical utility is dispatched without exceeding safety thresholds.

**MedRoute** is an intelligent web application designed to demonstrate the practical application of four foundational algorithm design strategies:
- **Greedy Strategy**: Single-Source Shortest Path (Dijkstra's Algorithm).
- **Greedy Strategy**: Minimum Spanning Tree (Prim's Algorithm).
- **Greedy Strategy with Disjoint Sets**: Minimum Spanning Tree (Kruskal's Algorithm).
- **Dynamic Programming Strategy**: 0/1 Knapsack Vehicle Payload Optimization.

---

## 2. Problem Statement

Existing enterprise emergency dispatch platforms are monolithic, proprietary, and mathematically opaque. Students and researchers studying algorithm design lack an interactive, transparent system where:
- Network topologies are modeled as explicit graph data structures stored in a relational database.
- Theoretical graph distance calculations can be directly juxtaposed against real-world road geometries (using OpenStreetMap and OSRM).
- Spanning tree algorithms can be visually compared on identical inputs to verify theoretical weight invariance.
- Combinatorial supply selection algorithms can be dynamically exercised under variable vehicle payload constraints.

MedRoute resolves this deficiency by providing an educational, fully functional, and visually professional medical logistics platform.

---

## 3. Existing System vs Proposed System

| Feature | Existing Systems | MedRoute Proposed System |
| :--- | :--- | :--- |
| **Algorithmic Transparency** | Proprietary black-box heuristic solvers | Transparent, manually implemented DAA algorithms with step-by-step reconstruction |
| **Graph vs Road Comparison** | Only raw GPS or only idealized straight lines | Dual visualization: Dijkstra on discrete graph vs OSRM on physical road geometry |
| **MST Demonstration** | Rarely provided; single proprietary tree | Side-by-side Prim's and Kruskal's comparison with green parity check |
| **Supply Cargo Optimization** | Separate enterprise ERP software | Integrated 0/1 Knapsack DP optimizer with interactive payload slider |
| **Presentation Readiness** | Hard to install; requires cloud clusters | Lightweight local Windows setup with Python, Flask, and MySQL 8.x |

---

## 4. System Requirements

### 4.1 Hardware Requirements
- **Processor**: Intel Core i3 / AMD Ryzen 3 or higher.
- **RAM**: Minimum 4 GB (8 GB recommended).
- **Storage**: Minimum 500 MB free hard disk space.
- **Display**: 1366x768 minimum resolution.

### 4.2 Software Requirements
- **Operating System**: Microsoft Windows 10/11 (or Linux / macOS).
- **Python**: Version 3.10.x or higher.
- **Database**: MySQL 8.0.x with MySQL Workbench.
- **Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge.
- **Internet Connection**: Required for OpenStreetMap tile rendering and public OSRM road geometry.

---

## 5. Software Requirements Specification (SRS)

### 5.1 Functional Requirements
- **FR1 (Facility Management)**: The system shall support CRUD operations for medical facilities, enforcing validation for coordinates and facility types.
- **FR2 (Network Connection Management)**: The system shall allow users to define undirected weighted edges between facilities with positive kilometer distances.
- **FR3 (Dijkstra Shortest Path)**: The system shall compute the shortest path between any two selected facilities using a binary min-heap priority queue and reconstruct the vertex sequence.
- **FR4 (OSRM Road Routing)**: The system shall query the OSRM public demonstration API using geographic coordinates, retrieve driving polylines, and handle network timeouts gracefully.
- **FR5 (Prim's & Kruskal's MST)**: The system shall compute the Minimum Spanning Tree of the medical network using both algorithms and verify total weight parity.
- **FR6 (0/1 Knapsack Allocation)**: The system shall select optimal supply cargo combinations maximizing priority scores under adjustable vehicle payload limits.
- **FR7 (Empirical Benchmarking)**: The system shall benchmark algorithm execution times across Small, Medium, and Large datasets using high-resolution timers.
- **FR8 (Audit History)**: The system shall record evaluated routes in persistent history for audit and reloading.

### 5.2 Non-Functional Requirements
- **NFR1 (Performance)**: Dijkstra, Prim's, Kruskal's, and Knapsack algorithms shall execute within 10 milliseconds for networks up to 100 vertices.
- **NFR2 (Reliability)**: In the event of an OSRM API outage, the system shall not crash and shall continue to display stored graph Dijkstra results.
- **NFR3 (Usability)**: Responsive, clean interface adhering to restrained medical palette (Dark Navy, Teal, Slate).

---

## 6. System Architecture and Design

### 6.1 Architectural Workflow
1. User interacts with the web dashboard (selecting source and destination).
2. The frontend triggers an asynchronous request to the backend.
3. The Flask application loads the graph topology from MySQL (`medical_locations` and `routes`).
4. Dijkstra's algorithm evaluates the shortest path through the stored graph.
5. In parallel, the routing service invokes OSRM with geographic coordinates.
6. The client renders the Leaflet map:
   - Green line: Network MST edges.
   - Blue line: OSRM turn-by-turn road polyline.
   - Teal dashed line: Dijkstra graph path.

### 6.2 Entity-Relationship (ER) Schema

```
[medical_locations] 1 -------< [routes] (source_location_id)
                    1 -------< [routes] (destination_location_id)
                    1 -------< [route_history] (source_location_id)
                    1 -------< [route_history] (destination_location_id)

[supply_items] (Independent catalog of medical goods for Knapsack DP)
```

---

## 7. Algorithm Design & Pseudocode

### 7.1 Dijkstra's Shortest Path Algorithm
```
Algorithm Dijkstra(V, E, source, destination):
    Initialize dist[v] = infinity for all v in V
    Initialize parent[v] = NIL for all v in V
    dist[source] = 0
    PriorityQueue Q = new MinHeap()
    Q.insert((0, source))
    visited = empty set

    while Q is not empty:
        (d, u) = Q.extract_min()
        if u in visited: continue
        visited.add(u)
        if u == destination: break

        for each neighbor v of u with weight w:
            if v not in visited and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                Q.insert((dist[v], v))

    return reconstruct_path(parent, destination), dist[destination]
```

### 7.2 Prim's Minimum Spanning Tree Algorithm
```
Algorithm Prim(V, E):
    visited = empty set
    selected_edges = empty list
    total_weight = 0
    start = V[0]
    visited.add(start)
    PriorityQueue Q = new MinHeap()
    for each edge (start, v, w): Q.insert((w, start, v))

    while Q is not empty and |visited| < |V|:
        (w, u, v) = Q.extract_min()
        if v in visited: continue
        visited.add(v)
        total_weight = total_weight + w
        selected_edges.append((u, v, w))
        for each edge (v, next_v, next_w):
            if next_v not in visited:
                Q.insert((next_w, v, next_v))

    return selected_edges, total_weight
```

### 7.3 Kruskal's Minimum Spanning Tree Algorithm
```
Algorithm Kruskal(V, E):
    Sort E in non-decreasing order of weight
    Initialize DisjointSetUnion DSU(V)
    selected_edges = empty list
    total_weight = 0

    for each (u, v, w) in sorted(E):
        if DSU.find(u) != DSU.find(v):
            DSU.union(u, v)
            selected_edges.append((u, v, w))
            total_weight = total_weight + w
            if |selected_edges| == |V| - 1:
                break

    return selected_edges, total_weight
```

### 7.4 0/1 Knapsack Dynamic Programming Algorithm
```
Algorithm Knapsack01(items, capacity W):
    n = |items|
    Let dp[0..n][0..W] = 0

    for i = 1 to n:
        wt = items[i].weight
        val = items[i].priority_value
        for w = 1 to W:
            if wt > w:
                dp[i][w] = dp[i-1][w]
            else:
                dp[i][w] = max(dp[i-1][w], val + dp[i-1][w - wt])

    // Backtrack to identify selected items
    selected = empty list
    curr_w = W
    for i = n down to 1:
        if dp[i][curr_w] != dp[i-1][curr_w]:
            selected.append(items[i])
            curr_w = curr_w - items[i].weight

    return dp[n][W], selected
```

---

## 8. Testing and Verification Results

All 11 unit tests in `medroute.tests.test_algorithms` pass successfully in 0.002 seconds:

```
...........
----------------------------------------------------------------------
Ran 11 tests in 0.002s

OK
```

### Test Cases Summary
| Test Case ID | Module Under Test | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `dijkstra.py` | Standard shortest path across multiple hops | Node sequence [1, 2, 3, 4], 20.0 km | **PASS** |
| **TC-02** | `dijkstra.py` | Source and destination identical | Single node [2], 0.0 km | **PASS** |
| **TC-03** | `dijkstra.py` | Unreachable isolated vertex | `found: False`, 0.0 km | **PASS** |
| **TC-04** | `prim.py` | Standard connected graph MST | 3 edges, 7.0 km total weight | **PASS** |
| **TC-05** | `kruskal.py` | Standard connected graph MST | 3 edges, 7.0 km total weight | **PASS** |
| **TC-06** | `mst_parity` | Prim and Kruskal comparison on multi-cycle network | Identical total spanning weight | **PASS** |
| **TC-07** | `prim.py` | Disconnected graph detection | `is_connected: False` | **PASS** |
| **TC-08** | `kruskal.py` | Disconnected graph detection | `is_connected: False` | **PASS** |
| **TC-09** | `knapsack.py` | Standard capacity optimization (W = 50) | Priority score = 220, weight <= 50 | **PASS** |
| **TC-10** | `knapsack.py` | Constrained capacity (W = 8) | Single highest value item fitting W | **PASS** |
| **TC-11** | `knapsack.py` | Zero vehicle capacity (W = 0) | Priority score = 0, weight = 0 | **PASS** |

---

## 9. Screenshots Checklist for Project Submission

When generating your submission PDF, take high-resolution screenshots of the following working views:

1. **Dashboard View**: Showing the top metric cards (7 Locations, 2 Distribution Centers, 5 Hospitals, 10 Edges) and interactive map preview.
2. **Medical Locations View**: Showing the table of facilities with coordinates, address, and filter buttons.
3. **Route Planner View (Active Route)**: Showing the calculated route between CMSD and Indraprastha Apollo Hospital with the solid blue OSRM road line and teal dashed Dijkstra graph line.
4. **Network Optimization View (MST)**: Showing both Prim's and Kruskal's algorithm cards with the green "Weight Parity Verified: 45.40 km" badge.
5. **Supply Allocation View**: Showing the payload slider set to 75 kg with the list of selected medical crates.
6. **Algorithm Analysis View**: Showing the multiscale execution time bar chart and measurements table.
7. **Python Source Code Explorer**: Showing the syntax-highlighted code for `dijkstra.py` and `schema.sql`.

---

## 10. Conclusion and Future Scope

MedRoute successfully achieves all academic objectives for an MCA Mini Project in Design and Analysis of Algorithms. By translating abstract graph concepts into a concrete healthcare logistics application, students and reviewers can visually explore how greedy graph search, spanning trees, dynamic programming, and geographic routing intersect.

Future enhancements include incorporating time-of-day dynamic traffic penalties and extending the 0/1 knapsack formulation into a full multi-vehicle vehicle routing heuristic.
