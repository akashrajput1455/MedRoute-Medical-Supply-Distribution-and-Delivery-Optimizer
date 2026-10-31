/**
 * Leaflet Map Component for MedRoute
 * Renders OpenStreetMap tiles, custom Hospital and Distribution Center markers,
 * route polylines, and popups.
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MedicalLocation } from '../types';

interface LeafletMapProps {
  locations: MedicalLocation[];
  selectedLocationId?: number | null;
  onSelectLocation?: (location: MedicalLocation) => void;
  roadRouteCoords?: [number, number][]; // [lat, lon]
  graphRouteCoords?: [number, number][]; // [lat, lon]
  height?: string;
  showAllNetworkEdges?: { u: MedicalLocation; v: MedicalLocation; distKm: number }[];
  highlightedEdgePairs?: { uId: number; vId: number }[];
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  roadRouteCoords,
  graphRouteCoords,
  height = '480px',
  showAllNetworkEdges = [],
  highlightedEdgePairs = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate default center from locations or Delhi NCR fallback
    const defaultCenter: [number, number] = locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [28.55, 77.22];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Custom attribution control in corner
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> | MedRoute')
      .addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Invalidate size after container renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update map markers, polylines, and bounds whenever props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Draw Network Edges if provided (e.g. for MST or network view)
    if (showAllNetworkEdges && showAllNetworkEdges.length > 0) {
      showAllNetworkEdges.forEach(edge => {
        const isHighlighted = highlightedEdgePairs.some(
          pair => (pair.uId === edge.u.id && pair.vId === edge.v.id) ||
                  (pair.uId === edge.v.id && pair.vId === edge.u.id)
        );

        const latlngs: [number, number][] = [
          [edge.u.latitude, edge.u.longitude],
          [edge.v.latitude, edge.v.longitude]
        ];

        const edgeLine = L.polyline(latlngs, {
          color: isHighlighted ? '#10b981' : '#cbd5e1',
          weight: isHighlighted ? 4 : 2,
          dashArray: isHighlighted ? undefined : '5, 5',
          opacity: isHighlighted ? 0.95 : 0.6
        });

        edgeLine.bindTooltip(
          `<strong>${edge.u.name}</strong> ↔ <strong>${edge.v.name}</strong><br/>Distance: ${edge.distKm} km`,
          { sticky: true }
        );

        layerGroup.addLayer(edgeLine);
      });
    }

    // 2. Draw Graph Dijkstra Route Line (dashed teal line) if provided
    if (graphRouteCoords && graphRouteCoords.length > 1) {
      const graphLine = L.polyline(graphRouteCoords, {
        color: '#0d9488',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.8
      });
      graphLine.bindTooltip('<strong>Dijkstra Stored Graph Path</strong>', { sticky: true });
      layerGroup.addLayer(graphLine);
      graphRouteCoords.forEach(pt => bounds.extend(pt));
    }

    // 3. Draw OSRM Road Route Line (solid bold navy/blue line) if provided
    if (roadRouteCoords && roadRouteCoords.length > 1) {
      const roadLine = L.polyline(roadRouteCoords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });
      roadLine.bindTooltip('<strong>OSRM Actual Road Route</strong>', { sticky: true });
      layerGroup.addLayer(roadLine);
      roadRouteCoords.forEach(pt => bounds.extend(pt));
    }

    // 4. Draw Location Markers
    locations.forEach(loc => {
      const isSelected = selectedLocationId === loc.id;
      const isDistribution = loc.locationType === 'Distribution Center';

      // SVG Icon for markers
      const iconBgColor = isDistribution ? '#0d9488' : '#2563eb';
      const iconBorderColor = isSelected ? '#f59e0b' : '#ffffff';
      const iconSymbol = isDistribution ? '📦' : '🏥';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${iconBgColor};
            border: 2px solid ${iconBorderColor};
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: transform 0.2s;
            transform: translate(-50%, -50%);
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${iconBgColor}; margin-bottom: 2px;">
            ${loc.locationType}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            ${loc.name}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            <i class="bi bi-geo-alt"></i> ${loc.address}
          </div>
          ${loc.contactNumber ? `<div style="font-size: 11px; color: #475569;"><strong>Tel:</strong> ${loc.contactNumber}</div>` : ''}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            GPS: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectLocation) {
        marker.on('click', () => onSelectLocation(loc));
      }

      layerGroup.addLayer(marker);
      bounds.extend([loc.latitude, loc.longitude]);
    });

    // Fit bounds smoothly if valid
    if (bounds.isValid() && (roadRouteCoords?.length || locations.length > 1)) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [locations, selectedLocationId, roadRouteCoords, graphRouteCoords, showAllNetworkEdges, highlightedEdgePairs, onSelectLocation]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 10 }} />
      {/* Legend Badge Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs flex items-center gap-4 text-slate-700 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-full bg-teal-600 flex items-center justify-center text-[9px] text-white">📦</span>
          <span>Distribution Hub</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">🏥</span>
          <span>Hospital</span>
        </div>
        {(roadRouteCoords && roadRouteCoords.length > 0) && (
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-4 h-1 bg-blue-600 rounded"></span>
            <span>OSRM Road Route</span>
          </div>
        )}
      </div>
    </div>
  );
};
