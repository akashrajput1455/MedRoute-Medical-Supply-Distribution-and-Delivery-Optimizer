/**
 * 0/1 Knapsack Dynamic Programming Algorithm
 * Design and Analysis of Algorithms (DAA)
 * 
 * Time Complexity: O(n * W), where n is supply count and W is vehicle payload capacity
 * Space Complexity: O(n * W) for complete 2D DP matrix enabling exact item reconstruction
 */

import { SupplyItem, KnapsackResult } from '../types';

export function knapsack01DP(
  items: SupplyItem[],
  capacity: number
): KnapsackResult {
  const startTime = performance.now();

  const validItems = items.filter(item => item.weight > 0 && item.priorityValue >= 0);
  const W = Math.max(0, Math.floor(capacity));
  const n = validItems.length;

  if (W === 0 || n === 0) {
    return {
      maxPriorityValue: 0,
      totalWeightUsed: 0,
      capacity: W,
      capacityUtilizationPercent: 0,
      selectedItems: [],
      unselectedItems: validItems,
      message: 'Zero payload capacity or no available medical supplies.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(3))
    };
  }

  // 1. Initialize DP table (n + 1) rows x (W + 1) cols
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  // 2. Build DP table bottom-up
  for (let i = 1; i <= n; i++) {
    const itemWeight = validItems[i - 1].weight;
    const itemValue = validItems[i - 1].priorityValue;

    for (let w = 1; w <= W; w++) {
      if (itemWeight > w) {
        dp[i][w] = dp[i - 1][w];
      } else {
        const excludeVal = dp[i - 1][w];
        const includeVal = itemValue + dp[i - 1][w - itemWeight];
        dp[i][w] = Math.max(excludeVal, includeVal);
      }
    }
  }

  const maxPriorityValue = dp[n][W];

  // 3. Backtrack to recover chosen items
  const selectedItems: SupplyItem[] = [];
  const unselectedItems: SupplyItem[] = [];
  let currentW = W;

  for (let i = n; i > 0; i--) {
    if (dp[i][currentW] !== dp[i - 1][currentW]) {
      const selected = validItems[i - 1];
      selectedItems.push(selected);
      currentW -= selected.weight;
    } else {
      unselectedItems.push(validItems[i - 1]);
    }
  }

  selectedItems.reverse();
  unselectedItems.reverse();

  const totalWeightUsed = selectedItems.reduce((acc, curr) => acc + curr.weight, 0);
  const utilization = W > 0 ? Number(((totalWeightUsed / W) * 100).toFixed(1)) : 0;
  const executionTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    maxPriorityValue,
    totalWeightUsed,
    capacity: W,
    capacityUtilizationPercent: utilization,
    selectedItems,
    unselectedItems,
    message: `Allocated ${selectedItems.length} essential medical supply batches totaling ${totalWeightUsed} kg (${utilization}% vehicle capacity) with maximum priority score of ${maxPriorityValue}.`,
    executionTimeMs
  };
}
