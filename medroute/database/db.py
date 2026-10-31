"""
Database Connection and Access Layer
Academic Project: MedRoute (MCA Mini Project - DAA)

Supports:
1. Primary: MySQL 8.x via PyMySQL (parameterized queries, transaction support).
2. Demonstration Fallback: SQLite3 standard library fallback if local MySQL is
   not started during quick viva presentations.
"""

import os
import sqlite3
from typing import List, Dict, Any, Optional
from medroute.config import Config

try:
    import pymysql
    import pymysql.cursors
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False


class DatabaseManager:
    """Manages database connectivity and parameterized queries for MedRoute."""

    def __init__(self):
        self.use_mysql = False
        self._test_connection()

    def _test_connection(self):
        """Attempts connection to MySQL server; flags fallback to SQLite if needed."""
        if PYMYSQL_AVAILABLE and Config.MYSQL_PASSWORD != "":
            try:
                conn = pymysql.connect(
                    host=Config.MYSQL_HOST,
                    port=Config.MYSQL_PORT,
                    user=Config.MYSQL_USER,
                    password=Config.MYSQL_PASSWORD,
                    database=Config.MYSQL_DB,
                    cursorclass=pymysql.cursors.DictCursor,
                    connect_timeout=3
                )
                conn.close()
                self.use_mysql = True
                print(f"[MedRoute DB] Connected to MySQL database '{Config.MYSQL_DB}' at {Config.MYSQL_HOST}:{Config.MYSQL_PORT}")
                return
            except Exception as e:
                print(f"[MedRoute DB] MySQL connection not active ({e}).")

        if Config.ENABLE_SQLITE_FALLBACK:
            self.use_mysql = False
            print(f"[MedRoute DB] Using local demonstration SQLite database '{Config.SQLITE_DB_PATH}'.")
            self._init_sqlite_if_needed()
        else:
            print("[MedRoute DB] Warning: MySQL is required and fallback is disabled.")

    def _init_sqlite_if_needed(self):
        """Initializes SQLite schema and sample data if db does not exist or is empty."""
        db_path = Config.SQLITE_DB_PATH
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='medical_locations'")
        if not cursor.fetchone():
            cursor.executescript("""
                CREATE TABLE medical_locations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    location_type TEXT NOT NULL,
                    address TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    contact_number TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE routes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_location_id INTEGER NOT NULL,
                    destination_location_id INTEGER NOT NULL,
                    distance_km REAL NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (source_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE,
                    FOREIGN KEY (destination_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE
                );

                CREATE TABLE supply_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    weight INTEGER NOT NULL,
                    priority_value INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE route_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_location_id INTEGER NOT NULL,
                    destination_location_id INTEGER NOT NULL,
                    algorithm_name TEXT DEFAULT 'Dijkstra + OSRM',
                    graph_distance_km REAL,
                    road_distance_km REAL,
                    estimated_duration_minutes REAL,
                    route_status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (source_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE,
                    FOREIGN KEY (destination_location_id) REFERENCES medical_locations(id) ON DELETE CASCADE
                );

                -- Sample Seed Locations
                INSERT INTO medical_locations (id, name, location_type, address, latitude, longitude, contact_number) VALUES
                (1, 'Central Medical Store Depot (CMSD)', 'Distribution Center', 'Sector 1, R.K. Puram, New Delhi', 28.5728, 77.1852, '+91-11-26178901'),
                (2, 'North Zone Medical Logistics Hub', 'Distribution Center', 'Okhla Phase III, Industrial Area, New Delhi', 28.5355, 77.2711, '+91-11-26814420'),
                (3, 'All India Institute of Medical Sciences (AIIMS)', 'Hospital', 'Sri Aurobindo Marg, Ansari Nagar, New Delhi', 28.5672, 77.2100, '+91-11-26588500'),
                (4, 'Safdarjung Hospital & Vardhman Mahavir College', 'Hospital', 'Ring Road, Opposite AIIMS, New Delhi', 28.5702, 77.2078, '+91-11-26165060'),
                (5, 'Max Super Speciality Hospital Saket', 'Hospital', '1, 2 Press Enclave Marg, Saket, New Delhi', 28.5283, 77.2125, '+91-11-26515050'),
                (6, 'Indraprastha Apollo Hospital', 'Hospital', 'Delhi-Mathura Road, Sarita Vihar, New Delhi', 28.5414, 77.2831, '+91-11-26925858'),
                (7, 'Fortis Memorial Research Institute', 'Hospital', 'Sector 44, Opposite HUDA City Centre, Gurugram', 28.4595, 77.0726, '+91-124-4962200');

                -- Sample Graph Edges (Undirected distances in km)
                INSERT INTO routes (source_location_id, destination_location_id, distance_km) VALUES
                (1, 4, 3.20),
                (1, 3, 3.80),
                (1, 7, 21.50),
                (4, 3, 0.90),
                (3, 5, 5.40),
                (5, 7, 16.80),
                (5, 2, 7.60),
                (2, 6, 2.80),
                (3, 2, 9.20),
                (6, 3, 11.00);

                -- Sample Supplies
                INSERT INTO supply_items (id, name, weight, priority_value) VALUES
                (1, 'Ultra-Cold mRNA Vaccine Crates', 15, 95),
                (2, 'High-Pressure Medical Oxygen Cylinders', 25, 90),
                (3, 'Emergency Trauma Surgical Kits', 8, 85),
                (4, 'Universal O-Negative Blood Transport Box', 12, 100),
                (5, 'Sterile Disposable PPE & Biohazard Bundles', 18, 60),
                (6, 'Portable Cardiac Defibrillators (AED)', 6, 80),
                (7, 'Pediatric Emergency Antibiotic Infusions', 4, 75),
                (8, 'Dialysis Fluid Concentrates', 30, 65);

                -- Initial Route History
                INSERT INTO route_history (source_location_id, destination_location_id, algorithm_name, graph_distance_km, road_distance_km, estimated_duration_minutes, route_status) VALUES
                (1, 6, 'Dijkstra + OSRM', 15.80, 17.20, 34.5, 'Success'),
                (1, 7, 'Dijkstra + OSRM', 21.50, 22.80, 42.0, 'Success');
            """)
            conn.commit()
        conn.close()

    def get_connection(self):
        """Returns active database connection."""
        if self.use_mysql and PYMYSQL_AVAILABLE:
            return pymysql.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
        else:
            conn = sqlite3.connect(Config.SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            return conn

    # -------------------------------------------------------------
    # Query Helpers
    # -------------------------------------------------------------
    def get_all_locations(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medical_locations ORDER BY name ASC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def get_location_by_id(self, loc_id: int) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        placeholder = "%s" if self.use_mysql else "?"
        cursor.execute(f"SELECT * FROM medical_locations WHERE id = {placeholder}", (loc_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def add_location(self, name: str, loc_type: str, address: str, lat: float, lon: float, contact: str = "") -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(
            f"INSERT INTO medical_locations (name, location_type, address, latitude, longitude, contact_number) VALUES ({p}, {p}, {p}, {p}, {p}, {p})",
            (name, loc_type, address, lat, lon, contact)
        )
        new_id = cursor.lastrowid
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return new_id

    def update_location(self, loc_id: int, name: str, loc_type: str, address: str, lat: float, lon: float, contact: str = "") -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(
            f"UPDATE medical_locations SET name={p}, location_type={p}, address={p}, latitude={p}, longitude={p}, contact_number={p} WHERE id={p}",
            (name, loc_type, address, lat, lon, contact, loc_id)
        )
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return True

    def delete_location(self, loc_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(f"DELETE FROM medical_locations WHERE id={p}", (loc_id,))
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return True

    def get_all_routes(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.id, r.source_location_id, r.destination_location_id, r.distance_km,
                   s.name as source_name, s.location_type as source_type,
                   d.name as destination_name, d.location_type as destination_type
            FROM routes r
            JOIN medical_locations s ON r.source_location_id = s.id
            JOIN medical_locations d ON r.destination_location_id = d.id
            ORDER BY r.id ASC
        """)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def add_route(self, source_id: int, destination_id: int, distance_km: float) -> bool:
        if source_id == destination_id:
            return False
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(
            f"INSERT INTO routes (source_location_id, destination_location_id, distance_km) VALUES ({p}, {p}, {p})",
            (source_id, destination_id, distance_km)
        )
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return True

    def delete_route(self, route_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(f"DELETE FROM routes WHERE id={p}", (route_id,))
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return True

    def get_graph_data(self) -> Dict[str, Any]:
        """Returns vertex list and edge tuples (u, v, weight) for DAA algorithms."""
        locations = self.get_all_locations()
        routes = self.get_all_routes()
        vertices = [loc["id"] for loc in locations]
        edges = [(r["source_location_id"], r["destination_location_id"], float(r["distance_km"])) for r in routes]
        return {
            "vertices": vertices,
            "edges": edges,
            "locations_map": {loc["id"]: loc for loc in locations}
        }

    def get_supply_items(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM supply_items ORDER BY id ASC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def add_supply_item(self, name: str, weight: int, priority_value: int) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(
            f"INSERT INTO supply_items (name, weight, priority_value) VALUES ({p}, {p}, {p})",
            (name, weight, priority_value)
        )
        new_id = cursor.lastrowid
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return new_id

    def delete_supply_item(self, item_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(f"DELETE FROM supply_items WHERE id={p}", (item_id,))
        if not self.use_mysql:
            conn.commit()
        conn.close()
        return True

    def log_route_history(self, source_id: int, dest_id: int, algo: str, graph_dist: Optional[float], road_dist: Optional[float], duration: Optional[float], status: str):
        conn = self.get_connection()
        cursor = conn.cursor()
        p = "%s" if self.use_mysql else "?"
        cursor.execute(
            f"INSERT INTO route_history (source_location_id, destination_location_id, algorithm_name, graph_distance_km, road_distance_km, estimated_duration_minutes, route_status) VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p})",
            (source_id, dest_id, algo, graph_dist, road_dist, duration, status)
        )
        if not self.use_mysql:
            conn.commit()
        conn.close()

    def get_route_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(f"""
            SELECT h.*, 
                   s.name as source_name, s.location_type as source_type,
                   d.name as destination_name, d.location_type as destination_type
            FROM route_history h
            JOIN medical_locations s ON h.source_location_id = s.id
            JOIN medical_locations d ON h.destination_location_id = d.id
            ORDER BY h.id DESC
            LIMIT {limit}
        """)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows


# Global singleton instance
db_manager = DatabaseManager()
