/**
 * Type definitions for MedRoute
 * Academic Mini Project: Master of Computer Applications (MCA) - DAA
 */

export type LocationType = 'Hospital' | 'Distribution Center';

export interface MedicalLocation {
  id: number;
  name: string;
  locationType: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber?: string;
  createdAt?: string;
}

export interface NetworkEdge {
  id: number;
  sourceLocationId: number;
  destinationLocationId: number;
  distanceKm: number;
  sourceName?: string;
  destinationName?: string;
}

export interface SupplyItem {
  id: number;
  name: string;
  weight: number; // in kg
  priorityValue: number; // utility score
}

export interface RouteHistoryRecord {
  id: number;
  sourceLocationId: number;
  destinationLocationId: number;
  sourceName: string;
  destinationName: string;
  algorithmName: string;
  graphDistanceKm: number | null;
  roadDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  routeStatus: 'Success' | 'No Graph Path' | 'OSRM Error' | 'Failed';
  timestamp: string;
}

export interface DijkstraResult {
  found: boolean;
  path: number[]; // array of location IDs
  totalDistanceKm: number;
  visitedCount: number;
  message: string;
  executionTimeMs?: number;
}

export interface OSRMResult {
  success: boolean;
  roadDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  coordinates: [number, number][]; // [lat, lon]
  waypointsCount?: number;
  error?: string | null;
}

export interface MSTEdge {
  source: number;
  destination: number;
  distanceKm: number;
  sourceName?: string;
  destinationName?: string;
}

export interface MSTResult {
  isConnected: boolean;
  totalMstDistanceKm: number;
  selectedEdges: MSTEdge[];
  vertexCount: number;
  edgeCount: number;
  message: string;
  executionTimeMs?: number;
}

export interface KnapsackResult {
  maxPriorityValue: number;
  totalWeightUsed: number;
  capacity: number;
  capacityUtilizationPercent: number;
  selectedItems: SupplyItem[];
  unselectedItems: SupplyItem[];
  message: string;
  executionTimeMs?: number;
}

export interface BenchmarkItem {
  scale: string;
  graphVertices: number;
  graphEdges: number;
  knapsackItems: number;
  knapsackCapacity: number;
  dijkstraMs: number;
  primMs: number;
  kruskalMs: number;
  knapsackMs: number;
  mstWeightPrim: number;
  mstWeightKruskal: number;
}

export type TabType = 
  | 'dashboard'
  | 'map'
  | 'locations'
  | 'route-planner'
  | 'network'
  | 'supply'
  | 'analysis'
  | 'history'
  | 'python-code'
  | 'about';
