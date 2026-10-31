/**
 * Supply Allocation View for MedRoute
 * 0/1 Knapsack Dynamic Programming for vehicle payload optimization
 */

import React, { useState } from 'react';
import { 
  Boxes, 
  Truck, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Scale, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SupplyItem, KnapsackResult } from '../types';
import { knapsack01DP } from '../algorithms/knapsack';

interface SupplyAllocationViewProps {
  items: SupplyItem[];
  onAddItem: (name: string, weight: number, priorityValue: number) => void;
  onDeleteItem: (id: number) => void;
}

export const SupplyAllocationView: React.FC<SupplyAllocationViewProps> = ({
  items,
  onAddItem,
  onDeleteItem
}) => {
  const [capacity, setCapacity] = useState<number>(50);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('10');
  const [newItemPriority, setNewItemPriority] = useState('80');
  const [itemError, setItemError] = useState('');

  // Run Knapsack DP
  const knapsackResult: KnapsackResult = knapsack01DP(items, capacity);

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setItemError('');

    if (!newItemName.trim()) {
      setItemError('Item name is required.');
      return;
    }

    const w = parseInt(newItemWeight, 10);
    const p = parseInt(newItemPriority, 10);

    if (isNaN(w) || w <= 0) {
      setItemError('Weight must be a positive integer in kg.');
      return;
    }
    if (isNaN(p) || p < 0) {
      setItemError('Priority value must be a non-negative integer.');
      return;
    }

    onAddItem(newItemName.trim(), w, p);
    setIsAddItemModalOpen(false);
    setNewItemName('');
  };

  return (
    <div className="space-y-6">
      {/* Concept Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Boxes size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Supply Allocation: 0/1 Knapsack (Dynamic Programming)
            </h3>
            <p className="text-xs text-slate-500">
              Selects the optimal subset of life-saving medical supplies maximizing total priority value under vehicle weight limit.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add Supply Item</span>
        </button>
      </div>

      {/* Vehicle Capacity Controller Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-indigo-600" />
            <h4 className="font-bold text-slate-900 text-sm">Dispatch Vehicle Payload Capacity (W)</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Preset Capacities:</span>
            {[30, 50, 75, 100].map(preset => (
              <button
                key={preset}
                onClick={() => setCapacity(preset)}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                  capacity === preset
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset} kg
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Adjust Payload Limit:</span>
              <span className="text-indigo-700 font-bold font-mono text-sm">{capacity} kg</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Light Drone / Van (10 kg)</span>
              <span>Standard Ambulance (50 kg)</span>
              <span>Heavy Logistics Truck (200 kg)</span>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-indigo-700 font-medium">DP Time Complexity</div>
              <div className="text-xs font-mono font-bold text-indigo-950 mt-0.5">O(n × W)</div>
              <div className="text-[11px] text-indigo-600 mt-1">
                {items.length} items × {capacity} kg = {items.length * capacity} operations
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Execution</span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {knapsackResult.executionTimeMs} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Max Priority Score Achieved</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
            {knapsackResult.maxPriorityValue}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sum of utility scores of selected items</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Weight Packed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {knapsackResult.totalWeightUsed} <span className="text-sm font-normal text-slate-500">/ {capacity} kg</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Capacity Utilization: <strong className="text-emerald-600">{knapsackResult.capacityUtilizationPercent}%</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Selected / Total Items</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {knapsackResult.selectedItems.length} <span className="text-sm font-normal text-slate-500">/ {items.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {knapsackResult.unselectedItems.length} items left behind due to payload limit
          </div>
        </div>
      </div>

      {/* Selected vs Unselected Items Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selected Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Selected for Vehicle Loading ({knapsackResult.selectedItems.length})
              </h4>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {knapsackResult.totalWeightUsed} kg packed
            </span>
          </div>

          {knapsackResult.selectedItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              No items could fit under the current capacity limit.
            </div>
          ) : (
            <div className="space-y-2">
              {knapsackResult.selectedItems.map(item => (
                <div key={item.id} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">Item ID: #{item.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                      {item.weight} kg
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                      +{item.priorityValue} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unselected Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-slate-400" />
              <h4 className="font-bold text-slate-900 text-sm">
                Unselected Supplies ({knapsackResult.unselectedItems.length})
              </h4>
            </div>
            <span className="text-xs text-slate-500">Exceeds capacity trade-off</span>
          </div>

          {knapsackResult.unselectedItems.length === 0 ? (
            <div className="py-8 text-center text-emerald-600 text-xs font-semibold">
              All available supply items were successfully accommodated!
            </div>
          ) : (
            <div className="space-y-2">
              {knapsackResult.unselectedItems.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-75 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-700">{item.name}</div>
                    <div className="text-[11px] text-slate-400">Item ID: #{item.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">
                      {item.weight} kg
                    </span>
                    <span className="font-mono text-slate-600">
                      {item.priorityValue} pts
                    </span>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Programming Theory Explanation for MCA Presentation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs text-slate-700 leading-relaxed">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
          <HelpCircle size={15} className="text-indigo-600" />
          <span>Dynamic Programming Recurrence Formulation</span>
        </h4>
        <p>
          The 0/1 Knapsack problem guarantees an optimal solution by building a 2D state matrix <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">dp[i][w]</code> representing the maximum priority value achievable considering the first <code className="font-mono">i</code> items with weight capacity <code className="font-mono">w</code>:
        </p>
        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px]">
          dp[i][w] = dp[i-1][w] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(if item_weight &gt; w)<br/>
          dp[i][w] = max(dp[i-1][w], priority_i + dp[i-1][w - weight_i]) &nbsp;(otherwise)
        </div>
        <p className="text-slate-500 text-[11px]">
          * Unlike fractional knapsack (which uses greedy sorting by ratio), 0/1 Knapsack forbids splitting crates, making dynamic programming essential for an exact optimal dispatch.
        </p>
      </div>

      {/* Add Supply Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Medical Supply Item</h3>

            {itemError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {itemError}
              </div>
            )}

            <form onSubmit={handleAddItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Description / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatric IV Insulin Sets"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weight Requirement (kg) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newItemWeight}
                  onChange={e => setNewItemWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority / Urgency Score (0 - 100) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={newItemPriority}
                  onChange={e => setNewItemPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
