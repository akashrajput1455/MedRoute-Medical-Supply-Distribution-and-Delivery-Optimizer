/**
 * MedRoute Main Application Component
 * Academic Mini Project for Master of Computer Applications (MCA)
 * Design and Analysis of Algorithms (DAA)
 */

import React, { useState } from 'react';
import { 
  TabType, 
  MedicalLocation, 
  NetworkEdge, 
  SupplyItem, 
  RouteHistoryRecord 
} from './types';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_EDGES, 
  INITIAL_SUPPLY_ITEMS, 
  INITIAL_ROUTE_HISTORY 
} from './data/seedData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { LocationsView } from './components/LocationsView';
import { RoutePlannerView } from './components/RoutePlannerView';
import { NetworkOptimizationView } from './components/NetworkOptimizationView';
import { SupplyAllocationView } from './components/SupplyAllocationView';
import { AlgorithmAnalysisView } from './components/AlgorithmAnalysisView';
import { RouteHistoryView } from './components/RouteHistoryView';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { AboutProjectView } from './components/AboutProjectView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Core Data Stores
  const [locations, setLocations] = useState<MedicalLocation[]>(INITIAL_LOCATIONS);
  const [edges, setEdges] = useState<NetworkEdge[]>(INITIAL_EDGES);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>(INITIAL_SUPPLY_ITEMS);
  const [history, setHistory] = useState<RouteHistoryRecord[]>(INITIAL_ROUTE_HISTORY);

  // Quick Action Modal Trigger for Adding Location
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // -------------------------------------------------------------
  // Location Handlers
  // -------------------------------------------------------------
  const handleAddLocation = (newLocData: Omit<MedicalLocation, 'id' | 'createdAt'>) => {
    const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
    const newLocation: MedicalLocation = {
      ...newLocData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLocations(prev => [...prev, newLocation]);
  };

  const handleUpdateLocation = (updated: MedicalLocation) => {
    setLocations(prev => prev.map(loc => (loc.id === updated.id ? updated : loc)));
  };

  const handleDeleteLocation = (id: number) => {
    // Delete location and any attached edges
    setLocations(prev => prev.filter(l => l.id !== id));
    setEdges(prev => prev.filter(e => e.sourceLocationId !== id && e.destinationLocationId !== id));
  };

  // -------------------------------------------------------------
  // Edge / Network Handlers
  // -------------------------------------------------------------
  const handleAddEdge = (sourceId: number, destId: number, distanceKm: number) => {
    const newId = edges.length > 0 ? Math.max(...edges.map(e => e.id)) + 1 : 1;
    const newEdge: NetworkEdge = {
      id: newId,
      sourceLocationId: sourceId,
      destinationLocationId: destId,
      distanceKm
    };
    setEdges(prev => [...prev, newEdge]);
  };

  const handleDeleteEdge = (edgeId: number) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  // -------------------------------------------------------------
  // Supply Items Handlers
  // -------------------------------------------------------------
  const handleAddSupplyItem = (name: string, weight: number, priorityValue: number) => {
    const newId = supplyItems.length > 0 ? Math.max(...supplyItems.map(i => i.id)) + 1 : 1;
    const newItem: SupplyItem = {
      id: newId,
      name,
      weight,
      priorityValue
    };
    setSupplyItems(prev => [...prev, newItem]);
  };

  const handleDeleteSupplyItem = (id: number) => {
    setSupplyItems(prev => prev.filter(i => i.id !== id));
  };

  // -------------------------------------------------------------
  // Route History Handlers
  // -------------------------------------------------------------
  const handleLogRouteHistory = (record: Omit<RouteHistoryRecord, 'id' | 'timestamp'>) => {
    const newId = history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];
    const newRecord: RouteHistoryRecord = {
      ...record,
      id: newId,
      timestamp: `${dateStr} ${timeStr}`
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectHistoricalRoute = (sourceId: number, destId: number) => {
    setCurrentTab('route-planner');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Sticky Top Header */}
        <Header
          currentTab={currentTab}
          onTabChange={tab => setCurrentTab(tab)}
          onOpenAddModal={() => setCurrentTab('locations')}
          collapsed={collapsed}
        />

        {/* View Router */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              locations={locations}
              edges={edges}
              history={history}
              onNavigate={tab => setCurrentTab(tab)}
              onOpenAddModal={() => setCurrentTab('locations')}
            />
          )}

          {currentTab === 'map' && (
            <InteractiveMapView
              locations={locations}
              edges={edges}
            />
          )}

          {currentTab === 'locations' && (
            <LocationsView
              locations={locations}
              onAddLocation={handleAddLocation}
              onUpdateLocation={handleUpdateLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          )}

          {currentTab === 'route-planner' && (
            <RoutePlannerView
              locations={locations}
              edges={edges}
              onLogHistory={handleLogRouteHistory}
            />
          )}

          {currentTab === 'network' && (
            <NetworkOptimizationView
              locations={locations}
              edges={edges}
              onAddEdge={handleAddEdge}
              onDeleteEdge={handleDeleteEdge}
            />
          )}

          {currentTab === 'supply' && (
            <SupplyAllocationView
              items={supplyItems}
              onAddItem={handleAddSupplyItem}
              onDeleteItem={handleDeleteSupplyItem}
            />
          )}

          {currentTab === 'analysis' && (
            <AlgorithmAnalysisView />
          )}

          {currentTab === 'history' && (
            <RouteHistoryView
              history={history}
              onClearHistory={handleClearHistory}
              onSelectHistoricalRoute={handleSelectHistoricalRoute}
            />
          )}

          {currentTab === 'python-code' && (
            <PythonCodeViewer />
          )}

          {currentTab === 'about' && (
            <AboutProjectView />
          )}
        </main>
      </div>
    </div>
  );
}
