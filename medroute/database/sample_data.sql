-- ====================================================================
-- MedRoute Sample Seed Data (MySQL 8.x)
-- Academic Mini Project: Master of Computer Applications (MCA)
-- Real-world verified medical logistics cluster (Delhi NCR region)
-- ====================================================================

USE medroute_db;

-- --------------------------------------------------------------------
-- Insert Medical Locations (2 Distribution Centers + 5 Major Hospitals)
-- --------------------------------------------------------------------
INSERT INTO medical_locations (id, name, location_type, address, latitude, longitude, contact_number) VALUES
(1, 'Central Medical Store Depot (CMSD)', 'Distribution Center', 'Sector 1, R.K. Puram, New Delhi', 28.5728000, 77.1852000, '+91-11-26178901'),
(2, 'North Zone Medical Logistics Hub', 'Distribution Center', 'Okhla Phase III, Industrial Area, New Delhi', 28.5355000, 77.2711000, '+91-11-26814420'),
(3, 'All India Institute of Medical Sciences (AIIMS)', 'Hospital', 'Sri Aurobindo Marg, Ansari Nagar, New Delhi', 28.5672000, 77.2100000, '+91-11-26588500'),
(4, 'Safdarjung Hospital & Vardhman Mahavir College', 'Hospital', 'Ring Road, Opposite AIIMS, New Delhi', 28.5702000, 77.2078000, '+91-11-26165060'),
(5, 'Max Super Speciality Hospital Saket', 'Hospital', '1, 2 Press Enclave Marg, Saket, New Delhi', 28.5283000, 77.2125000, '+91-11-26515050'),
(6, 'Indraprastha Apollo Hospital', 'Hospital', 'Delhi-Mathura Road, Sarita Vihar, New Delhi', 28.5414000, 77.2831000, '+91-11-26925858'),
(7, 'Fortis Memorial Research Institute', 'Hospital', 'Sector 44, Opposite HUDA City Centre, Gurugram', 28.4595000, 77.0726000, '+91-124-4962200');

-- --------------------------------------------------------------------
-- Insert Medical Network Graph Connections (Undirected Edges)
-- Designed with alternate paths for Dijkstra and a rich connected graph for MST
-- --------------------------------------------------------------------
INSERT INTO routes (source_location_id, destination_location_id, distance_km) VALUES
-- CMSD (1) connections
(1, 4, 3.20),   -- CMSD to Safdarjung Hospital (via Ring Road)
(1, 3, 3.80),   -- CMSD to AIIMS (via Ring Road / Aurobindo Marg)
(1, 7, 21.50),  -- CMSD to Fortis Gurugram (via NH-48 Expressway)

-- Safdarjung (4) and AIIMS (3) adjacent cluster
(4, 3, 0.90),   -- Safdarjung to AIIMS (Across Ring Road)
(3, 5, 5.40),   -- AIIMS to Max Saket (via Sri Aurobindo Marg)

-- Max Saket (5) connections
(5, 7, 16.80),  -- Max Saket to Fortis Gurugram (via Mehrauli-Gurgaon Road)
(5, 2, 7.60),   -- Max Saket to North Zone Hub Okhla (via Maa Anandmayee Marg)

-- North Zone Logistics Hub (2) connections
(2, 6, 2.80),   -- North Zone Hub to Apollo Hospital Sarita Vihar
(3, 2, 9.20),   -- AIIMS to North Zone Hub (via Barapullah / Mathura Road)
(6, 3, 11.00);  -- Apollo Hospital to AIIMS (via Ring Road)

-- --------------------------------------------------------------------
-- Insert Medical Supply Items (for 0/1 Knapsack DP)
-- --------------------------------------------------------------------
INSERT INTO supply_items (id, name, weight, priority_value) VALUES
(1, 'Ultra-Cold mRNA Vaccine Crates', 15, 95),
(2, 'High-Pressure Medical Oxygen Cylinders', 25, 90),
(3, 'Emergency Trauma Surgical Kits', 8, 85),
(4, 'Universal O-Negative Blood Transport Box', 12, 100),
(5, 'Sterile Disposable PPE & Biohazard Bundles', 18, 60),
(6, 'Portable Cardiac Defibrillators (AED)', 6, 80),
(7, 'Pediatric Emergency Antibiotic Infusions', 4, 75),
(8, 'Dialysis Fluid Concentrates', 30, 65);

-- --------------------------------------------------------------------
-- Initial Route History Record for Demonstration
-- --------------------------------------------------------------------
INSERT INTO route_history (source_location_id, destination_location_id, algorithm_name, graph_distance_km, road_distance_km, estimated_duration_minutes, route_status) VALUES
(1, 6, 'Dijkstra + OSRM', 15.80, 17.20, 34.5, 'Success'),
(1, 7, 'Dijkstra + OSRM', 21.50, 22.80, 42.0, 'Success');
