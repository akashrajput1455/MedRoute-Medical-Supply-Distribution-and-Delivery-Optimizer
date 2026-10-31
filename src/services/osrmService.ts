/**
 * OSRM Road Routing Service for MedRoute
 * Connects to public OSRM API to fetch actual road polyline geometry,
 * distance, and estimated travel duration.
 */

import { OSRMResult } from '../types';

export async function fetchOSRMRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  timeoutMs = 7000
): Promise<OSRMResult> {
  const endpoint = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        roadDistanceKm: null,
        estimatedDurationMinutes: null,
        coordinates: [],
        error: `OSRM demo server returned HTTP status ${response.status}.`
      };
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        roadDistanceKm: null,
        estimatedDurationMinutes: null,
        coordinates: [],
        error: data.message || 'No road route found between selected coordinates.'
      };
    }

    const primaryRoute = data.routes[0];
    const distanceMeters = primaryRoute.distance || 0;
    const durationSeconds = primaryRoute.duration || 0;

    const roadDistanceKm = Number((distanceMeters / 1000).toFixed(2));
    const estimatedDurationMinutes = Number((durationSeconds / 60).toFixed(1));

    // Convert GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
    const rawCoords: [number, number][] = primaryRoute.geometry?.coordinates || [];
    const coordinates: [number, number][] = rawCoords.map(([lon, lat]) => [lat, lon]);

    return {
      success: true,
      roadDistanceKm,
      estimatedDurationMinutes,
      coordinates,
      waypointsCount: coordinates.length,
      error: null
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      roadDistanceKm: null,
      estimatedDurationMinutes: null,
      coordinates: [],
      error: `Road routing service unavailable (${msg}). Stored Dijkstra graph route is still fully active.`
    };
  }
}
