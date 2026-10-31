/**
 * Seed data for MedRoute
 * Verified real-world medical logistics cluster in Delhi NCR
 */

import { MedicalLocation, NetworkEdge, SupplyItem, RouteHistoryRecord } from '../types';

export const INITIAL_LOCATIONS: MedicalLocation[] = [
  {
    id: 1,
    name: 'Central Medical Store Depot (CMSD)',
    locationType: 'Distribution Center',
    address: 'Sector 1, R.K. Puram, New Delhi',
    latitude: 28.5728,
    longitude: 77.1852,
    contactNumber: '+91-11-26178901',
    createdAt: '2026-10-20'
  },
  {
    id: 2,
    name: 'North Zone Medical Logistics Hub',
    locationType: 'Distribution Center',
    address: 'Okhla Phase III, Industrial Area, New Delhi',
    latitude: 28.5355,
    longitude: 77.2711,
    contactNumber: '+91-11-26814420',
    createdAt: '2026-10-20'
  },
  {
    id: 3,
    name: 'All India Institute of Medical Sciences (AIIMS)',
    locationType: 'Hospital',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    latitude: 28.5672,
    longitude: 77.2100,
    contactNumber: '+91-11-26588500',
    createdAt: '2026-10-20'
  },
  {
    id: 4,
    name: 'Safdarjung Hospital & VMMC',
    locationType: 'Hospital',
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    latitude: 28.5702,
    longitude: 77.2078,
    contactNumber: '+91-11-26165060',
    createdAt: '2026-10-20'
  },
  {
    id: 5,
    name: 'Max Super Speciality Hospital Saket',
    locationType: 'Hospital',
    address: '1, 2 Press Enclave Marg, Saket, New Delhi',
    latitude: 28.5283,
    longitude: 77.2125,
    contactNumber: '+91-11-26515050',
    createdAt: '2026-10-21'
  },
  {
    id: 6,
    name: 'Indraprastha Apollo Hospital',
    locationType: 'Hospital',
    address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi',
    latitude: 28.5414,
    longitude: 77.2831,
    contactNumber: '+91-11-26925858',
    createdAt: '2026-10-21'
  },
  {
    id: 7,
    name: 'Fortis Memorial Research Institute',
    locationType: 'Hospital',
    address: 'Sector 44, Opposite HUDA City Centre, Gurugram',
    latitude: 28.4595,
    longitude: 77.0726,
    contactNumber: '+91-124-4962200',
    createdAt: '2026-10-22'
  }
];

export const INITIAL_EDGES: NetworkEdge[] = [
  { id: 1, sourceLocationId: 1, destinationLocationId: 4, distanceKm: 3.20 },
  { id: 2, sourceLocationId: 1, destinationLocationId: 3, distanceKm: 3.80 },
  { id: 3, sourceLocationId: 1, destinationLocationId: 7, distanceKm: 21.50 },
  { id: 4, sourceLocationId: 4, destinationLocationId: 3, distanceKm: 0.90 },
  { id: 5, sourceLocationId: 3, destinationLocationId: 5, distanceKm: 5.40 },
  { id: 6, sourceLocationId: 5, destinationLocationId: 7, distanceKm: 16.80 },
  { id: 7, sourceLocationId: 5, destinationLocationId: 2, distanceKm: 7.60 },
  { id: 8, sourceLocationId: 2, destinationLocationId: 6, distanceKm: 2.80 },
  { id: 9, sourceLocationId: 3, destinationLocationId: 2, distanceKm: 9.20 },
  { id: 10, sourceLocationId: 6, destinationLocationId: 3, distanceKm: 11.00 }
];

export const INITIAL_SUPPLY_ITEMS: SupplyItem[] = [
  { id: 1, name: 'Ultra-Cold mRNA Vaccine Crates', weight: 15, priorityValue: 95 },
  { id: 2, name: 'High-Pressure Medical Oxygen Cylinders', weight: 25, priorityValue: 90 },
  { id: 3, name: 'Emergency Trauma Surgical Kits', weight: 8, priorityValue: 85 },
  { id: 4, name: 'Universal O-Negative Blood Transport Box', weight: 12, priorityValue: 100 },
  { id: 5, name: 'Sterile Disposable PPE & Biohazard Bundles', weight: 18, priorityValue: 60 },
  { id: 6, name: 'Portable Cardiac Defibrillators (AED)', weight: 6, priorityValue: 80 },
  { id: 7, name: 'Pediatric Emergency Antibiotic Infusions', weight: 4, priorityValue: 75 },
  { id: 8, name: 'Dialysis Fluid Concentrates', weight: 30, priorityValue: 65 }
];

export const INITIAL_ROUTE_HISTORY: RouteHistoryRecord[] = [
  {
    id: 1,
    sourceLocationId: 1,
    destinationLocationId: 6,
    sourceName: 'Central Medical Store Depot (CMSD)',
    destinationName: 'Indraprastha Apollo Hospital',
    algorithmName: 'Dijkstra + OSRM',
    graphDistanceKm: 15.80,
    roadDistanceKm: 17.20,
    estimatedDurationMinutes: 34.5,
    routeStatus: 'Success',
    timestamp: '2026-10-31 10:45 AM'
  },
  {
    id: 2,
    sourceLocationId: 1,
    destinationLocationId: 7,
    sourceName: 'Central Medical Store Depot (CMSD)',
    destinationName: 'Fortis Memorial Research Institute',
    algorithmName: 'Dijkstra + OSRM',
    graphDistanceKm: 21.50,
    roadDistanceKm: 22.80,
    estimatedDurationMinutes: 42.0,
    routeStatus: 'Success',
    timestamp: '2026-10-31 11:20 AM'
  }
];
