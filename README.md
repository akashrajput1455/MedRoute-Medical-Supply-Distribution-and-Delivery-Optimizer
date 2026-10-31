# MedRoute: An Intelligent Medical Supply Distribution and Route Optimization System

> **Academic Mini Project**  
> **Degree**: Master of Computer Applications (MCA)  
> **Specialization**: Artificial Intelligence & Machine Learning  
> **Subject**: Design and Analysis of Algorithms (DAA)  

---

## 1. Abstract

During medical crises, timely and resource-efficient distribution of life-saving medical supplies (such as whole blood units, ultra-cold mRNA vaccines, oxygen cylinders, and emergency surgical kits) can mean the difference between life and death. **MedRoute** is a comprehensive, beginner-friendly web application developed to demonstrate how classical Design and Analysis of Algorithms (DAA) principles are applied to solve real-world healthcare logistics challenges.

MedRoute integrates four core algorithmic strategies:
1. **Dijkstra's Algorithm** with a binary min-heap for single-source shortest path routing through the transportation network.
2. **Prim's Algorithm** using a priority queue to establish a minimum-cost network spanning tree.
3. **Kruskal's Algorithm** with Disjoint Set Union (DSU) featuring path compression and union-by-rank to prevent cycles while achieving identical minimum spanning weight.
4. **0/1 Knapsack Algorithm** utilizing dynamic programming to maximize priority scores under vehicle payload capacity limits.

To bridge academic graph theory with real-world geographic routing, MedRoute cross-references stored discrete graph calculations with the **Open Source Routing Machine (OSRM)** API and visualizes true road networks using **Leaflet.js** and **OpenStreetMap**.

---

## 2. Problem Statement

Medical distribution logistics face two interrelated computational bottlenecks:
- **Spatial Routing Dilemma**: Hospital networks comprise non-uniform road connections where transit distance and physical road geometry differ substantially from idealized straight-line distance. Dispatchers need to determine shortest transit routes between centralized depots and healthcare centers.
- **Payload Capacity Dilemma**: Transport vehicles (ambulances, drones, logistics vans) have rigid weight limits ($W$). Dispatchers cannot split critical supplies into fractions and must select the highest-value subset without exceeding capacity.

Existing enterprise logistics software is proprietary, excessively complex, and obscures the underlying algorithmic logic. MedRoute resolves this by providing a clean, modular, and fully explainable implementation tailored for university academic demonstration.

---

## 3. Project Objectives

1. Model healthcare facilities (Distribution Hubs and Hospitals) as a weighted undirected graph $G = (V, E)$.
2. Manually implement Dijkstra's algorithm to compute shortest paths with step-by-step path reconstruction.
3. Implement both Prim's and Kruskal's algorithms and verify their theoretical total weight parity.
4. Implement the 0/1 Knapsack dynamic programming algorithm with backtracking to allocate cargo to dispatch vehicles.
5. Integrate OSRM and Leaflet.js to draw real road polylines, travel distances, and driving durations.
6. Benchmark empirical execution times of all algorithms using high-precision timers across Small, Medium, and Large datasets.
7. Provide an audit log of historical route calculations and complete CRUD management for healthcare facilities and connections.

---

## 4. Scope of the Project

- **In Scope**:
  - Medical facility registry with verified coordinates (Delhi NCR healthcare cluster).
  - Graph-based road network management with positive kilometer weights.
  - Manual, library-independent Python and TypeScript implementations of all 4 DAA algorithms.
  - Interactive Leaflet mapping with OpenStreetMap tiles.
  - OSRM demonstration road-routing integration with graceful error fallback.
  - Performance benchmarking comparing empirical timings to Big-O complexities.
  - MySQL 8.x schema with foreign key constraints and parameter-bound queries.
- **Out of Scope**:
  - Live GPS vehicle tracking and IoT telemetry.
  - Machine learning-based real-time traffic prediction.
  - Multi-vehicle fleet dispatch and driver mobile apps.

---

## 5. Technology Stack

### Backend
- **Python 3.10+**: Core programming language.
- **Flask 3.x**: Lightweight Web Server Gateway Interface (WSGI) framework.
- **PyMySQL 1.1+**: Pure-Python MySQL client.
- **Python Standard Library**: `heapq`, `time.perf_counter()`, `unittest`, `json`, `urllib.request`.

### Database
- **MySQL 8.x**: Relational database management system with foreign keys, checks, and unique indexes.
- *(Demonstration SQLite fallback included for instant standalone viva demos)*.

### Frontend
- **HTML5, CSS3, JavaScript / TypeScript**: Modern web standards.
- **Leaflet.js 1.9.4**: Open-source interactive map engine.
- **OpenStreetMap**: Public map tile layers.
- **OSRM API**: Public driving route geometry and duration service.
- **Tailwind CSS & Bootstrap 5**: Clean, responsive layout styling.

---

## 6. System Architecture

```
+---------------------------------------------------------------------------------+
|                                USER INTERFACE                                   |
|   Dashboard | Interactive Map | Route Planner | MST Network | Supply Knapsack   |
+---------------------------------------------------------------------------------+
                                      |
                         HTTP / REST API Requests
                                      v
+---------------------------------------------------------------------------------+
|                           FLASK APPLICATION SERVER                              |
|                           (medroute/app.py & config.py)                         |
+---------------------------------------------------------------------------------+
           |                                       |                     |
   DAA Algorithms Layer                Database Access Layer     External Routing
+-------------------------+         +-------------------------+  +--------------+
| dijkstra.py (heapq)     |         | MySQL 8.x (medroute_db) |  | OSRM Driving |
| prim.py (cut min-heap)  | <-----> | - medical_locations     |  | API &        |
| kruskal.py (DSU rank)   |         | - routes (graph edges)  |  | OpenStreetMap|
| knapsack.py (2D DP)     |         | - supply_items          |  | Tiles        |
| benchmark.py (perf)     |         | - route_history         |  +--------------+
+-------------------------+         +-------------------------+
```

---

## 7. Database Schema

The application uses `medroute_db` with four core normalized tables:

1. **`medical_locations`**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(150) NOT NULL
   - `location_type`: ENUM('Hospital', 'Distribution Center')
   - `address`: VARCHAR(255) NOT NULL
   - `latitude`, `longitude`: DECIMAL(10, 7) NOT NULL
   - `contact_number`: VARCHAR(25) NULL

2. **`routes`** (Undirected Graph Edges):
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `source_location_id`: INT (FK -> medical_locations.id)
   - `destination_location_id`: INT (FK -> medical_locations.id)
   - `distance_km`: DECIMAL(6, 2) NOT NULL (> 0)
   - *Unique undirected index on `(LEAST(source, destination), GREATEST(source, destination))`*

3. **`supply_items`**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(150) NOT NULL
   - `weight`: INT NOT NULL (> 0 kg)
   - `priority_value`: INT NOT NULL (>= 0 utility score)

4. **`route_history`**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `source_location_id`, `destination_location_id`: INT (FKs)
   - `algorithm_name`: VARCHAR(50) DEFAULT 'Dijkstra + OSRM'
   - `graph_distance_km`: DECIMAL(6, 2)
   - `road_distance_km`: DECIMAL(6, 2)
   - `estimated_duration_minutes`: DECIMAL(6, 1)
   - `route_status`: ENUM('Success', 'No Graph Path', 'OSRM Error', 'Failed')

---

## 8. Implemented DAA Algorithms & Complexities

| Algorithm | Problem Solved | Primary Data Structure | Time Complexity | Space Complexity | MedRoute Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dijkstra's** | Single-Source Shortest Path | Binary Min-Heap (`heapq`), Adjacency List | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V + E)$ | Finds shortest path sequence from distribution hub to hospital |
| **Prim's MST** | Minimum Spanning Tree | Binary Cut-Edge Heap, Adjacency List | $\mathcal{O}(E \log V)$ | $\mathcal{O}(V + E)$ | Finds minimal total road infrastructure to connect all clinics without cycles |
| **Kruskal's MST** | Minimum Spanning Tree | Disjoint Set Union (Path Compression & Rank) | $\mathcal{O}(E \log E)$ | $\mathcal{O}(V + E)$ | Greedily sorts edges and unions components, verifying weight parity |
| **0/1 Knapsack** | Payload Optimization | 2D Dynamic Programming Table | $\mathcal{O}(n \cdot W)$ | $\mathcal{O}(n \cdot W)$ | Maximizes life-saving cargo priority under vehicle weight limit |

---

## 9. Local Setup & Execution on Windows

Follow these steps in order on your Windows machine:

### Step 1: Create and Seed MySQL Database
1. Open **MySQL Workbench** or the **MySQL Command Line Client**.
2. Run the schema creation file:
   ```sql
   SOURCE C:/path/to/medroute/database/schema.sql;
   ```
3. Import the sample verification dataset:
   ```sql
   SOURCE C:/path/to/medroute/database/sample_data.sql;
   ```

### Step 2: Set Up Python Virtual Environment
Open PowerShell in the project directory:
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Required Python Packages
```powershell
pip install -r medroute/requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Edit `.env` with your local MySQL password:
```ini
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_password_here
MYSQL_DB=medroute_db
```

### Step 5: Run Unit Tests
Verify all 11 algorithm tests pass:
```powershell
python -m unittest medroute.tests.test_algorithms
```

### Step 6: Start Flask Server
```powershell
python -m medroute.app
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 10. Sample Demonstration Presentation Workflow

Follow this sequence during your college viva:

1. **Dashboard Overview**: Show total medical facilities (7), distribution centers (2), and hospitals (5). Point out the geographic preview.
2. **Medical Location Registry**: Open the "Medical Locations" tab. Filter by "Distribution Center" and "Hospital". Demonstrate adding a facility with latitude and longitude.
3. **Route Planner (Core Feature)**:
   - Select Source: `Central Medical Store Depot (CMSD)` (ID 1).
   - Select Destination: `Indraprastha Apollo Hospital` (ID 6).
   - Click **"Find Shortest Route"**.
   - Show the resulting map:
     - Blue solid polyline: **OSRM Road Route** (17.20 km, ~34.5 mins).
     - Teal dashed polyline: **Dijkstra Stored Graph Path** (15.80 km, evaluated nodes sequence).
   - Explain why graph distance and road distance differ.
4. **Network Optimization (MST)**:
   - Navigate to "Network MST".
   - Highlight the **Weight Parity Badge**: `Prim's MST = Kruskal's MST = 45.40 km`.
   - Explain how Prim's grows from an initial vertex using cut-edges while Kruskal sorts all edges and uses DSU to prevent cycles.
5. **Supply Allocation (0/1 Knapsack)**:
   - Move the vehicle payload capacity slider from 50 kg to 80 kg.
   - Show how the dynamic programming algorithm dynamically re-evaluates the optimal set of supplies and updates capacity utilization.
6. **Algorithm Analysis**:
   - Run the live benchmark. Show the bar chart and table comparing execution times across Small, Medium, and Large datasets.
7. **Source Code Inspector**:
   - Switch to the "Python Source Code" tab to show clean, commented code for `dijkstra.py`, `prim.py`, `kruskal.py`, and `knapsack.py`.

---

## 11. Limitations & Future Scope

- **Public OSRM Rate Limits**: MedRoute connects to the public demo OSRM server, which requires an active internet connection. If the API is unreachable, Dijkstra graph routing operates seamlessly as a fallback.
- **Future Scope**:
  - Incorporate time-dependent edge weights for peak rush-hour traffic modeling.
  - Extend knapsack to multi-compartment refrigerated vaccine storage.
  - Implement Capacitated Vehicle Routing Problem (CVRP) heuristics for multi-stop round-trip delivery.
