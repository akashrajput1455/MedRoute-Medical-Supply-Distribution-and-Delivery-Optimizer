"""
MedRoute - Intelligent Medical Supply Distribution and Route Optimization System
Academic Mini Project for Master of Computer Applications (MCA)
Main Flask Application Server
"""

import time
from typing import Dict, Any
from medroute.config import Config
from medroute.database.db import db_manager
from medroute.algorithms.dijkstra import dijkstra_shortest_path
from medroute.algorithms.prim import prim_minimum_spanning_tree
from medroute.algorithms.kruskal import kruskal_minimum_spanning_tree
from medroute.algorithms.knapsack import knapsack_01_dp
from medroute.algorithms.benchmark import run_benchmark_suite
from medroute.services.routing_service import RoutingService

try:
    from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
except ImportError:
    Flask = None


def create_app():
    if Flask is None:
        raise RuntimeError("Flask is not installed. Run 'pip install -r requirements.txt'")

    app = Flask(__name__)
    app.config.from_object(Config)

    routing_service = RoutingService(base_url=app.config.get("OSRM_API_URL", "https://router.project-osrm.org"))

    # -------------------------------------------------------------
    # Page Routes
    # -------------------------------------------------------------
    @app.route("/")
    def dashboard():
        locations = db_manager.get_all_locations()
        routes = db_manager.get_all_routes()
        history = db_manager.get_route_history(limit=5)
        hospitals_count = sum(1 for loc in locations if loc["location_type"] == "Hospital")
        distribution_count = sum(1 for loc in locations if loc["location_type"] == "Distribution Center")
        
        return render_template(
            "dashboard.html",
            total_locations=len(locations),
            hospitals_count=hospitals_count,
            distribution_count=distribution_count,
            total_routes=len(routes),
            history=history,
            locations=locations
        )

    @app.route("/map")
    def interactive_map():
        locations = db_manager.get_all_locations()
        routes = db_manager.get_all_routes()
        return render_template("map.html", locations=locations, routes=routes)

    @app.route("/locations")
    def locations_page():
        locations = db_manager.get_all_locations()
        return render_template("locations.html", locations=locations)

    @app.route("/route-planner")
    def route_planner_page():
        locations = db_manager.get_all_locations()
        return render_template("route_planner.html", locations=locations)

    @app.route("/network-optimization")
    def network_optimization_page():
        locations = db_manager.get_all_locations()
        routes = db_manager.get_all_routes()
        return render_template("network.html", locations=locations, routes=routes)

    @app.route("/supply-allocation")
    def supply_allocation_page():
        items = db_manager.get_supply_items()
        return render_template("supply.html", items=items)

    @app.route("/algorithm-analysis")
    def algorithm_analysis_page():
        return render_template("algorithm_analysis.html")

    @app.route("/route-history")
    def route_history_page():
        history = db_manager.get_route_history(limit=50)
        return render_template("route_history.html", history=history)

    @app.route("/about")
    def about_page():
        return render_template("about.html")

    # -------------------------------------------------------------
    # REST API Endpoints
    # -------------------------------------------------------------
    @app.route("/api/locations", methods=["GET", "POST"])
    def api_locations():
        if request.method == "POST":
            data = request.get_json() or request.form
            name = data.get("name", "").strip()
            loc_type = data.get("location_type", "Hospital")
            address = data.get("address", "").strip()
            lat = float(data.get("latitude", 0.0))
            lon = float(data.get("longitude", 0.0))
            contact = data.get("contact_number", "").strip()

            if not name or not address:
                return jsonify({"success": False, "error": "Name and address are required"}), 400

            new_id = db_manager.add_location(name, loc_type, address, lat, lon, contact)
            return jsonify({"success": True, "id": new_id})
        
        return jsonify(db_manager.get_all_locations())

    @app.route("/api/locations/<int:loc_id>", methods=["DELETE"])
    def api_delete_location(loc_id):
        db_manager.delete_location(loc_id)
        return jsonify({"success": True})

    @app.route("/api/connections", methods=["GET", "POST"])
    def api_connections():
        if request.method == "POST":
            data = request.get_json() or request.form
            src = int(data.get("source_location_id"))
            dst = int(data.get("destination_location_id"))
            dist = float(data.get("distance_km"))
            if src == dst or dist <= 0:
                return jsonify({"success": False, "error": "Invalid edge parameters"}), 400
            db_manager.add_route(src, dst, dist)
            return jsonify({"success": True})
        return jsonify(db_manager.get_all_routes())

    @app.route("/api/plan-route", methods=["POST"])
    def api_plan_route():
        data = request.get_json()
        source_id = int(data.get("source_location_id"))
        dest_id = int(data.get("destination_location_id"))

        # 1. Dijkstra on application's stored medical network graph
        graph_data = db_manager.get_graph_data()
        dijkstra_result = dijkstra_shortest_path(
            graph_data["vertices"],
            graph_data["edges"],
            source_id,
            dest_id
        )

        # 2. OSRM Road routing using geographic coordinates
        src_loc = graph_data["locations_map"].get(source_id)
        dst_loc = graph_data["locations_map"].get(dest_id)

        osrm_result = {"success": False, "road_distance_km": None, "estimated_duration_minutes": None, "coordinates": []}
        if src_loc and dst_loc:
            osrm_result = routing_service.get_road_route(
                float(src_loc["latitude"]),
                float(src_loc["longitude"]),
                float(dst_loc["latitude"]),
                float(dst_loc["longitude"])
            )

        # 3. Log into database history
        status = "Success" if (dijkstra_result["found"] or osrm_result["success"]) else "Failed"
        db_manager.log_route_history(
            source_id=source_id,
            dest_id=dest_id,
            algo="Dijkstra + OSRM",
            graph_dist=dijkstra_result.get("total_distance_km"),
            road_dist=osrm_result.get("road_distance_km"),
            duration=osrm_result.get("estimated_duration_minutes"),
            status=status
        )

        # Build path details with location names
        path_nodes = []
        for nid in dijkstra_result.get("path", []):
            if nid in graph_data["locations_map"]:
                path_nodes.append(graph_data["locations_map"][nid])

        return jsonify({
            "success": True,
            "source": src_loc,
            "destination": dst_loc,
            "dijkstra": {
                **dijkstra_result,
                "path_nodes": path_nodes
            },
            "osrm": osrm_result
        })

    @app.route("/api/mst", methods=["GET"])
    def api_mst():
        graph_data = db_manager.get_graph_data()
        prim_res = prim_minimum_spanning_tree(graph_data["vertices"], graph_data["edges"])
        kruskal_res = kruskal_minimum_spanning_tree(graph_data["vertices"], graph_data["edges"])
        return jsonify({
            "prim": prim_res,
            "kruskal": kruskal_res,
            "total_vertices": len(graph_data["vertices"]),
            "total_edges": len(graph_data["edges"]),
            "weight_matches": prim_res["total_mst_distance_km"] == kruskal_res["total_mst_distance_km"]
        })

    @app.route("/api/knapsack", methods=["POST"])
    def api_knapsack():
        data = request.get_json() or {}
        capacity = int(data.get("capacity", 50))
        items = data.get("items") or db_manager.get_supply_items()
        result = knapsack_01_dp(items, capacity)
        return jsonify(result)

    @app.route("/api/benchmark", methods=["GET"])
    def api_benchmark():
        results = run_benchmark_suite()
        return jsonify(results)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
