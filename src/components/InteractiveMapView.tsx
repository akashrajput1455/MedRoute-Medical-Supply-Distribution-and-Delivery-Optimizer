/**
 * Interactive Map View for MedRoute
 * Full map exploration with OpenStreetMap tiles, facility filters,
 * clickable markers, and network connection overlay.
 */

import React, { useState } from 'react';
import { MedicalLocation, NetworkEdge } from '../types';
import { LeafletMap } from './LeafletMap';
import { Filter, MapPin, Hospital, Warehouse, Navigation, ExternalLink } from 'lucide-react';

interface InteractiveMapViewProps {
  locations: MedicalLocation[];
  edges: NetworkEdge[];
  onSelectLocationForRoute?: (sourceId: number) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  locations,
  edges,
  onSelectLocationForRoute
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Hospital' | 'Distribution Center'>('All');
  const [selectedLocation, setSelectedLocation] = useState<MedicalLocation | null>(null);
  const [showNetworkEdges, setShowNetworkEdges] = useState(true);

  const filteredLocations = locations.filter(loc => {
    if (filterType === 'All') return true;
    return loc.locationType === filterType;
  });

  // Map edges to pairs of locations for visualization
  const locMap = new Map<number, MedicalLocation>(locations.map(l => [l.id, l]));
  const networkEdgesForMap = edges
    .filter(e => locMap.has(e.sourceLocationId) && locMap.has(e.destinationLocationId))
    .map(e => ({
      u: locMap.get(e.sourceLocationId)!,
      v: locMap.get(e.destinationLocationId)!,
      distKm: e.distanceKm
    }));

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filter Facilities:</span>
          <div className="flex items-center gap-1.5">
            {(['All', 'Hospital', 'Distribution Center'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterType === type
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'All' ? 'All (7)' : type === 'Hospital' ? 'Hospitals (5)' : 'Distribution Hubs (2)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showNetworkEdges}
              onChange={e => setShowNetworkEdges(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium">Show Graph Network Connections</span>
          </label>
        </div>
      </div>

      {/* Main Map and Sidebar Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map View */}
        <div className="lg:col-span-3">
          <LeafletMap
            locations={filteredLocations}
            selectedLocationId={selectedLocation?.id}
            onSelectLocation={loc => setSelectedLocation(loc)}
            height="580px"
            showAllNetworkEdges={showNetworkEdges ? networkEdgesForMap : []}
          />
        </div>

        {/* Selected Facility Panel / Location List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between max-h-[580px] overflow-y-auto">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
              <span>Facility Registry</span>
              <span className="text-xs font-normal text-slate-500">{filteredLocations.length} visible</span>
            </h3>

            {selectedLocation ? (
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    selectedLocation.locationType === 'Distribution Center'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedLocation.locationType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">ID: #{selectedLocation.id}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedLocation.name}</h4>
                <p className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                  <MapPin size={13} className="shrink-0 mt-0.5 text-slate-400" />
                  <span>{selectedLocation.address}</span>
                </p>
                {selectedLocation.contactNumber && (
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Contact:</strong> {selectedLocation.contactNumber}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                  GPS: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded transition"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 mb-3">
                Click any marker on the map to inspect facility logistics details.
              </div>
            )}

            {/* List of facilities */}
            <div className="space-y-1.5">
              {filteredLocations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                    selectedLocation?.id === loc.id
                      ? 'border-teal-500 bg-teal-50/60 font-semibold'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">
                      {loc.locationType === 'Distribution Center' ? '📦' : '🏥'}
                    </span>
                    <span className="truncate">{loc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {loc.locationType === 'Distribution Center' ? 'Hub' : 'Hospital'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            * Verified geographic coordinates in Delhi NCR medical cluster.
          </div>
        </div>
      </div>
    </div>
  );
};
