"""
OSRM (Open Source Routing Machine) Service Module
Academic Project: MedRoute (MCA Mini Project - DAA)

Purpose:
Connects to the public OSRM demonstration service to retrieve:
1. Real turn-by-turn road driving distance in kilometers.
2. Estimated real-world driving duration in minutes.
3. GeoJSON road geometry coordinates for Leaflet polyline visualization.

Academic Distinction Note:
MedRoute explicitly separates the stored academic graph (solved via Dijkstra)
from real-world road networks (solved via OSRM). This module handles the latter.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional


class RoutingService:
    def __init__(self, base_url: str = "https://router.project-osrm.org"):
        self.base_url = base_url.rstrip("/")

    def get_road_route(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        timeout_seconds: int = 8
    ) -> Dict[str, Any]:
        """
        Queries OSRM driving service between (start_lat, start_lon) and (end_lat, end_lon).

        Returns:
            dict containing:
                - success: bool
                - road_distance_km: float
                - estimated_duration_minutes: float
                - coordinates: List of [lat, lon] tuples for Leaflet polyline
                - summary: str
                - error: Optional[str]
        """
        # OSRM expects coordinates in order: {longitude},{latitude}
        endpoint = (
            f"{self.base_url}/route/v1/driving/"
            f"{start_lon:.6f},{start_lat:.6f};{end_lon:.6f},{end_lat:.6f}"
            f"?overview=full&geometries=geojson&steps=false"
        )

        headers = {
            "User-Agent": "MedRoute-Academic-DAA-Project/1.0"
        }

        try:
            req = urllib.request.Request(endpoint, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
                if response.status != 200:
                    return {
                        "success": False,
                        "road_distance_km": None,
                        "estimated_duration_minutes": None,
                        "coordinates": [],
                        "error": f"OSRM service returned HTTP status {response.status}."
                    }

                data = json.loads(response.read().decode("utf-8"))

            if data.get("code") != "Ok" or not data.get("routes"):
                return {
                    "success": False,
                    "road_distance_km": None,
                    "estimated_duration_minutes": None,
                    "coordinates": [],
                    "error": data.get("message", "No drivable road route found between selected coordinates.")
                }

            primary_route = data["routes"][0]
            # OSRM returns distance in meters, duration in seconds
            distance_meters = primary_route.get("distance", 0.0)
            duration_seconds = primary_route.get("duration", 0.0)

            # Convert to km and minutes
            distance_km = round(distance_meters / 1000.0, 2)
            duration_minutes = round(duration_seconds / 60.0, 1)

            # GeoJSON coordinates are [lon, lat] - convert to [lat, lon] for Leaflet
            geojson_coords = primary_route.get("geometry", {}).get("coordinates", [])
            leaflet_coords = [[point[1], point[0]] for point in geojson_coords]

            return {
                "success": True,
                "road_distance_km": distance_km,
                "estimated_duration_minutes": duration_minutes,
                "coordinates": leaflet_coords,
                "waypoints_count": len(leaflet_coords),
                "error": None,
                "summary": f"Road route: {distance_km} km (~{duration_minutes} mins driving)"
            }

        except urllib.error.URLError as e:
            return {
                "success": False,
                "road_distance_km": None,
                "estimated_duration_minutes": None,
                "coordinates": [],
                "error": f"Unable to reach public OSRM service ({e.reason}). Dijkstra graph calculation is still functional."
            }
        except Exception as e:
            return {
                "success": False,
                "road_distance_km": None,
                "estimated_duration_minutes": None,
                "coordinates": [],
                "error": f"Routing calculation exception: {str(e)}"
            }
