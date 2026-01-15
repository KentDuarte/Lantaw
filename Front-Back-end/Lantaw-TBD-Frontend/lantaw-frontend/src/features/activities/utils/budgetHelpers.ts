// These functions handle budget calculations and status determinations.

export interface BudgetStatus {
  text: string;
  color: string;
}

// Calculate budget variance and return status
export const getBudgetStatus = (
  projected: number,
  actual: number
): BudgetStatus => {
  const variance = actual - projected;
  
  if (variance === 0) {
    return { text: "", color: "text-gray-600" };
  } else if (variance > 0) {
    return {
      text: `- ₱${variance.toLocaleString()}`,
      color: "text-red-600",
    };
  } else {
    return {
      text: `+ ₱${Math.abs(variance).toLocaleString()}`,
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
export const formatCurrency = (amount: number | string | null): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount || 0;
  return `₱${numAmount.toLocaleString()}`;
};

