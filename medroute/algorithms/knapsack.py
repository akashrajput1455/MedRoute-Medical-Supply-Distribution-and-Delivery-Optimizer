"""
0/1 Knapsack Dynamic Programming Algorithm
Academic Project: MedRoute (MCA Mini Project - DAA)

Purpose:
Select the optimal combination of critical medical supplies (medicines, vaccines,
blood units, PPE kits, surgical equipment) for distribution vehicles such that:
1. Total weight does not exceed the vehicle's payload capacity (W).
2. Total priority value (life-saving urgency score) is maximized.
3. Each item can be either fully selected (1) or left behind (0) - no fractional items.

Time Complexity:
O(n * W), where n is the number of supply items and W is vehicle capacity.
Space Complexity:
O(n * W) for the 2D Dynamic Programming table enabling exact item reconstruction.
"""

from typing import Dict, List, Any


def knapsack_01_dp(
    items: List[Dict[str, Any]],
    capacity: int
) -> Dict[str, Any]:
    """
    Computes optimal 0/1 knapsack supply allocation using dynamic programming.

    Parameters:
        items: List of dictionaries with keys:
               - 'id': int
               - 'name': str
               - 'weight': int (kg)
               - 'priority_value': int (utility score)
        capacity: int, Maximum vehicle weight capacity in kg

    Returns:
        dict containing:
            - max_priority_value: int
            - total_weight_used: int
            - capacity: int
            - capacity_utilization_percent: float
            - selected_items: List of item dicts
            - unselected_items: List of item dicts
            - message: str
    """
    if capacity <= 0 or not items:
        return {
            "max_priority_value": 0,
            "total_weight_used": 0,
            "capacity": max(0, capacity),
            "capacity_utilization_percent": 0.0,
            "selected_items": [],
            "unselected_items": items.copy(),
            "message": "Zero capacity or no medical supplies available for loading."
        }

    # Clean and validate input items
    valid_items = []
    for item in items:
        w = int(item.get("weight", 0))
        p = int(item.get("priority_value", 0))
        if w > 0 and p >= 0:
            valid_items.append({
                "id": item.get("id"),
                "name": item.get("name", "Medical Item"),
                "weight": w,
                "priority_value": p
            })

    n = len(valid_items)
    W = int(capacity)

    # 1. Initialize DP table of size (n + 1) x (W + 1) with zeros
    # dp[i][w] stores maximum priority value achievable using subset of first i items
    # subject to max weight w.
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    # 2. Fill DP table iteratively
    # Recurrence relation:
    # If item weight w_i > current capacity w:
    #    dp[i][w] = dp[i-1][w]
    # Else:
    #    dp[i][w] = max(dp[i-1][w], priority_i + dp[i-1][w - weight_i])
    for i in range(1, n + 1):
        item_w = valid_items[i - 1]["weight"]
        item_p = valid_items[i - 1]["priority_value"]

        for w in range(1, W + 1):
            if item_w > w:
                dp[i][w] = dp[i - 1][w]
            else:
                exclude_val = dp[i - 1][w]
                include_val = item_p + dp[i - 1][w - item_w]
                dp[i][w] = max(exclude_val, include_val)

    max_priority = dp[n][W]

    # 3. Backtrack to find the exact set of selected items
    selected_items: List[Dict[str, Any]] = []
    unselected_items: List[Dict[str, Any]] = []
    
    current_w = W
    for i in range(n, 0, -1):
        # If value is different from cell directly above, item (i - 1) was included
        if dp[i][current_w] != dp[i - 1][current_w]:
            selected = valid_items[i - 1]
            selected_items.append(selected)
            current_w -= selected["weight"]
        else:
            unselected_items.append(valid_items[i - 1])

    # Reverse to restore original ordering
    selected_items.reverse()
    unselected_items.reverse()

    total_weight_used = sum(item["weight"] for item in selected_items)
    utilization = round((total_weight_used / W) * 100, 1) if W > 0 else 0.0

    return {
        "max_priority_value": max_priority,
        "total_weight_used": total_weight_used,
        "capacity": W,
        "capacity_utilization_percent": utilization,
        "selected_items": selected_items,
        "unselected_items": unselected_items,
        "message": f"Optimal allocation selected {len(selected_items)} medical items totaling {total_weight_used} kg ({utilization}% of {W} kg capacity) with cumulative priority score of {max_priority}."
    }
