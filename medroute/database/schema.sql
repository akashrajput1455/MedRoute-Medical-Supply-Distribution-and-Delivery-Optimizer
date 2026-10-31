-- ====================================================================
-- MedRoute Database Schema (MySQL 8.x)
-- Academic Mini Project: Master of Computer Applications (MCA)
-- System: MedRoute - Medical Supply Distribution & Route Optimization
-- ====================================================================

CREATE DATABASE IF NOT EXISTS medroute_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medroute_db;

-- --------------------------------------------------------------------
-- Table 1: medical_locations
-- Stores Hospitals and Distribution Centers with verified coordinates
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS route_history;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS supply_items;
DROP TABLE IF EXISTS medical_locations;

CREATE TABLE medical_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location_type ENUM('Hospital', 'Distribution Center') NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_number VARCHAR(25) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_coordinates CHECK (
        latitude BETWEEN -90.0 AND 90.0 AND
        longitude BETWEEN -180.0 AND 180.0
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table 2: routes
-- Stores weighted undirected network graph connections between medical locations
-- --------------------------------------------------------------------
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_location_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routes_source FOREIGN KEY (source_location_id) 
        REFERENCES medical_locations(id) ON DELETE CASCADE,
    CONSTRAINT fk_routes_destination FOREIGN KEY (destination_location_id) 
        REFERENCES medical_locations(id) ON DELETE CASCADE,
    CONSTRAINT chk_different_locations CHECK (source_location_id != destination_location_id),
    CONSTRAINT chk_positive_distance CHECK (distance_km > 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure undirected uniqueness: (u, v) is identical to (v, u)
CREATE UNIQUE INDEX idx_unique_undirected_route ON routes (
    (LEAST(source_location_id, destination_location_id)),
    (GREATEST(source_location_id, destination_location_id))
);

-- --------------------------------------------------------------------
-- Table 3: supply_items
-- Stores emergency medical items, vaccine crates, and trauma supplies for 0/1 Knapsack
-- --------------------------------------------------------------------
CREATE TABLE supply_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    weight INT NOT NULL,
    priority_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_weight CHECK (weight > 0),
    CONSTRAINT chk_non_negative_priority CHECK (priority_value >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table 4: route_history
-- Logs historical route calculations (Dijkstra graph vs OSRM road comparison)
-- --------------------------------------------------------------------
CREATE TABLE route_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_location_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    algorithm_name VARCHAR(50) NOT NULL DEFAULT 'Dijkstra + OSRM',
    graph_distance_km DECIMAL(6, 2) NULL,
    road_distance_km DECIMAL(6, 2) NULL,
    estimated_duration_minutes DECIMAL(6, 1) NULL,
    route_status ENUM('Success', 'No Graph Path', 'OSRM Error', 'Failed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_source FOREIGN KEY (source_location_id) 
        REFERENCES medical_locations(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_destination FOREIGN KEY (destination_location_id) 
        REFERENCES medical_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
