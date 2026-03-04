// These functions handle budget calculations and status determinations.

export interface BudgetStatus {
  text: string;
  color: string;
}

// Calculate budget variance and return status
// If hideForExecutive is true, hides peso amounts in status text.
export const getBudgetStatus = (
  projected: number,
  actual: number,
  hideForExecutive: boolean = false
): BudgetStatus => {
  const variance = actual - projected;
  
  if (variance === 0) {
    return { text: "", color: "text-gray-600" };
  } else if (variance > 0) {
    return {
      text: hideForExecutive ? "- ---" : `- ₱${variance.toLocaleString()}`,
      color: "text-red-600",
    };
  } else {
    return {
      text: hideForExecutive ? "+ ---" : `+ ₱${Math.abs(variance).toLocaleString()}`,
      color: "text-green-600",
    };
  }
};

// Calculate balance (projected - actual)
export const calculateBalance = (
  projected: number,
  actual: number
): number => {
  return projected - actual;
};

// Check if activity is over budget
export const isOverBudget = (projected: number, actual: number): boolean => {
  return actual > projected;
};

// Format currency amount
// If hideForExecutive is true, returns "---" instead of the formatted amount.
export const formatCurrency = (
  amount: number | string | null,
  hideForExecutive: boolean = false
): string => {
  if (hideForExecutive) {
    return "---";
  }
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount || 0;
  return `₱${numAmount.toLocaleString()}`;
};

