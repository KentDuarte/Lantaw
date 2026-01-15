// Formats a string or number into Philippine Peso currency.
// Handles null/undefined by defaulting to 0.
export const formatCurrency = (amount: string | number | null): string => {
  const val = Number(amount || 0);
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP' 
  }).format(val);
};

// Formats a date string into a local date string.
export  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };