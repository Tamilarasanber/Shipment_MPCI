export const getLabel = (options = [], value) => {
  if (!value) return "-";
  return options.find(opt => opt.value === value)?.label || value;
};