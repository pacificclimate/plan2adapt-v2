export const nearZeroAbsolute = (value, tolerance = 1e-5) => {
  return Math.abs(value) < tolerance;
};
