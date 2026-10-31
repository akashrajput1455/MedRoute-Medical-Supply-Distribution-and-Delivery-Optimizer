/**
 * Route Planner View for MedRoute
 * Computes Dijkstra's Shortest Path on the application's stored medical graph
 * and retrieves real road geometry from OSRM, presenting a side-by-side comparison.
 */

import React, { useState } from 'react';
import { 
  Route, 
  MapPin, 
  Navigation, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Compass, 
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { MedicalLocation, NetworkEdge, DijkstraResult, OSRMResult, RouteHistoryRecord } from '../types';
import { LeafletMap } from './LeafletMap';
import { dijkstraShortestPath } from '../algorithms/dijkstra';
import { fetchOSRMRoute } from '../services/osrmService';

interface RoutePlannerViewProps {
  locations: MedicalLocation[];
  edges: NetworkEdge[];
  onLogHistory: (record: Omit<RouteHistoryRecord, 'id' | 'timestamp'>) => void;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  locations,
  edges,
  onLogHistory
}) => {
  const [sourceId, setSourceId] = useState<number>(locations[0]?.id || 1);
  const [destinationId, setDestinationId] = useState<number>(locations[locations.length - 1]?.id || 7);

  const [isLoading, setIsLoading] = useState(false);
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [osrmResult, setOsrmResult] = useState<OSRMResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const sourceLocation = locations.find(l => l.id === sourceId);
  const destinationLocation = locations.find(l => l.id === destinationId);

  // Prepare graph edge tuples [u, v, weight]
  const edgeTuples: [number, number, number][] = edges.map(e => [
    e.sourceLocationId,
    e.destinationLocationId,
    e.distanceKm
  ]);
  const vertices = locations.map(l => l.id);

  const handleCalculateRoute = async () => {
    if (sourceId === destinationId) {
      alert('Please select two distinct locations for route planning.');
      return;
    }

    setIsLoading(true);
    setHasCalculated(true);

    // 1. Execute Dijkstra's Algorithm on application's stored medical graph
    const dijkstraRes = dijkstraShortestPath(vertices, edgeTuples, sourceId, destinationId);
    setDijkstraResult(dijkstraRes);

    // 2. Fetch OSRM Road Route between real GPS coordinates
    let osrmRes: OSRMResult = {
      success: false,
      roadDistanceKm: null,
      estimatedDurationMinutes: null,
      coordinates: [],
      error: null
    };

    if (sourceLocation && destinationLocation) {
      osrmRes = await fetchOSRMRoute(
        sourceLocation.latitude,
        sourceLocation.longitude,
        destinationLocation.latitude,
        destinationLocation.longitude
      );
      setOsrmResult(osrmRes);
    }

    setIsLoading(false);

    // 3. Log into Route History
    if (sourceLocation && destinationLocation) {
      const status = dijkstraRes.found || osrmRes.success ? 'Success' : 'Failed';
      onLogHistory({
        sourceLocationId: sourceId,
        destinationLocationId: destinationId,
        sourceName: sourceLocation.name,
        destinationName: destinationLocation.name,
        algorithmName: 'Dijkstra + OSRM',
        graphDistanceKm: dijkstraRes.found ? dijkstraRes.totalDistanceKm : null,
        roadDistanceKm: osrmRes.success ? osrmRes.roadDistanceKm : null,
        estimatedDurationMinutes: osrmRes.success ? osrmRes.estimatedDurationMinutes : null,
        routeStatus: status
      });
    }
  };

  const handleClear = () => {
    setDijkstraResult(null);
    setOsrmResult(null);
    setHasCalculated(false);
  };

  // Convert Dijkstra path IDs to lat/lon coordinates for polyline
  const locMap = new Map<number, MedicalLocation>(locations.map(l => [l.id, l]));
  const graphRouteCoords: [number, number][] = (dijkstraResult?.path || [])
    .map(id => locMap.get(id))
    .filter((loc): loc is MedicalLocation => Boolean(loc))
    .map(loc => [loc.latitude, loc.longitude]);

  return (
    <div className="space-y-6">
      {/* Route Selection Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Navigation size={18} className="text-teal-600" />
          <span>Configure Dispatch Endpoints</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Starting Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
              <span>Source (Distribution Hub / Hospital)</span>
            </label>
            <select
              value={sourceId}
              onChange={e => setSourceId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.locationType === 'Distribution Center' ? '📦 [Hub]' : '🏥 [Hosp]'} {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span>Destination (Hospital / Receiving Center)</span>
            </label>
            <select
              value={destinationId}
              onChange={e => setDestinationId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.locationType === 'Distribution Center' ? '📦 [Hub]' : '🏥 [Hosp]'} {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Distance Metric:</span>
            <span>Kilometers (km)</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">OSRM Service:</span>
            <span className="text-emerald-600 font-medium">Public OpenStreetMap Routing</span>
          </div>

          <div className="flex items-center gap-2.5">
            {hasCalculated && (
              <button
                onClick={handleClear}
                className="px-3.5 py-2 border border-slate-300 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleCalculateRoute}
              disabled={isLoading || sourceId === destinationId}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Calculating Route...</span>
                </>
              ) : (
                <>
                  <Compass size={15} />
                  <span>Find Shortest Route</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Results Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800">Route Geometry & Network Map</span>
              {hasCalculated && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <span className="w-3 h-1 bg-blue-600 rounded"></span> OSRM Road
                  </span>
                  <span className="flex items-center gap-1 text-teal-600 font-medium">
                    <span className="w-3 h-1 bg-teal-600 rounded border-dashed"></span> Dijkstra Graph
                  </span>
                </div>
              )}
            </div>

            <LeafletMap
              locations={locations}
              selectedLocationId={destinationId}
              roadRouteCoords={osrmResult?.coordinates}
              graphRouteCoords={graphRouteCoords}
              height="480px"
            />
          </div>
        </div>

        {/* Route Summary Details Column */}
        <div className="space-y-4">
          {/* Card: Calculation Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Route Optimization Results</span>
              {hasCalculated && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Calculated
                </span>
              )}
            </h4>

            {!hasCalculated ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Route size={32} className="mx-auto text-slate-300" />
                <p className="text-xs">Select source and destination facilities and click <strong>"Find Shortest Route"</strong> to execute.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Result 1: Dijkstra Stored Graph Algorithm */}
                <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between text-teal-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <Cpu size={14} className="text-teal-600" />
                      1. Dijkstra's Algorithm (Graph)
                    </span>
                    <span className="text-[10px] bg-teal-200/60 text-teal-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                      O((V+E) log V)
                    </span>
                  </div>

                  {dijkstraResult?.found ? (
                    <>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-slate-600">Graph Distance:</span>
                        <span className="font-bold text-slate-900 text-base font-mono">
                          {dijkstraResult.totalDistanceKm} km
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">Network Hops:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {dijkstraResult.path.length - 1} hops ({dijkstraResult.path.length} vertices)
                        </span>
                      </div>
                      {dijkstraResult.executionTimeMs !== undefined && (
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-600">Execution Time:</span>
                          <span className="font-mono text-teal-700 font-semibold">
                            {dijkstraResult.executionTimeMs} ms
                          </span>
                        </div>
                      )}

                      {/* Path Sequence Breakdown */}
                      <div className="pt-2 border-t border-teal-200/60">
                        <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Evaluated Sequence of Facilities:
                        </span>
                        <div className="space-y-1">
                          {dijkstraResult.path.map((nodeId, idx) => {
                            const nodeLoc = locMap.get(nodeId);
                            return (
                              <div key={nodeId} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <span className="font-medium truncate">{nodeLoc?.name || `Node #${nodeId}`}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600 p-2 bg-red-50 rounded border border-red-200">
                      {dijkstraResult?.message || 'No graph connection path found.'}
                    </div>
                  )}
                </div>

                {/* Result 2: OSRM Real Road Route */}
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-blue-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <Navigation size={14} className="text-blue-600" />
                      2. OSRM Road Driving Route
                    </span>
                    <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                      OpenStreetMap API
                    </span>
                  </div>

                  {osrmResult?.success ? (
                    <>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-slate-600">Actual Road Distance:</span>
                        <span className="font-bold text-blue-900 text-base font-mono">
                          {osrmResult.roadDistanceKm} km
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">Estimated Travel Time:</span>
                        <span className="font-bold text-emerald-700 text-sm font-mono flex items-center gap-1">
                          <Clock size={13} />
                          ~{osrmResult.estimatedDurationMinutes} minutes
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">GPS Waypoints:</span>
                        <span className="font-mono text-slate-700">
                          {osrmResult.waypointsCount} road segments
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1 text-xs">
                        <AlertCircle size={13} />
                        <span>Road Service Note</span>
                      </div>
                      <p className="text-[11px] leading-tight">
                        {osrmResult?.error || 'Road route retrieval unavailable. Dijkstra graph result is preserved above.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Comparison Note for Viva Presentation */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <HelpCircle size={13} className="text-teal-600" />
                    <span>Why do Graph and Road distances differ?</span>
                  </div>
                  <p>
                    <strong>Dijkstra's Algorithm</strong> operates on the simplified weighted transportation graph stored in the database. 
                    <strong> OSRM</strong> calculates the route through the physical road geometry of OpenStreetMap, taking one-way streets, flyovers, and curves into account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
