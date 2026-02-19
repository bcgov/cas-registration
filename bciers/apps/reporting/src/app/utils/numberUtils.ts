const FLOATING_POINT_PRECISION_FACTOR = 10000; // 4 decimal places

export const sumWithPrecision = (...values: number[]): number =>
  parseFloat(
    (
      values.reduce((acc, v) => acc + v * FLOATING_POINT_PRECISION_FACTOR, 0) /
      FLOATING_POINT_PRECISION_FACTOR
    ).toFixed(4),
  );
