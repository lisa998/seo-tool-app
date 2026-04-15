export const formatCompactNumber = (value: number, decimals: number) => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(value);
};
