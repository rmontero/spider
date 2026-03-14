import { Dimension, ScaleConfig } from "@/types/spider-graph";

/** Convert degrees to radians */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the angle (in radians) for axis at index i.
 * The first axis is placed at -90° (top), then rotated clockwise evenly.
 */
export function getAxisAngle(index: number, total: number): number {
  return toRadians(-90 + (360 / total) * index);
}

/**
 * Generate the (x, y) vertices of a regular polygon centered at (cx, cy)
 * with a given radius and number of sides.
 */
export function getPolygonVertices(
  sides: number,
  radius: number,
  cx: number,
  cy: number
): { x: number; y: number }[] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = getAxisAngle(i, sides);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

/**
 * Generate vertices for all concentric polygons representing scale levels.
 * Returns one vertex array per scale level (from innermost to outermost).
 */
export function getScalePolygons(
  dimensions: Dimension[],
  scale: ScaleConfig,
  maxRadius: number,
  cx: number,
  cy: number
): { x: number; y: number }[][] {
  const sides = dimensions.length;
  const levels: { x: number; y: number }[][] = [];
  const steps = Math.round((scale.max - scale.min) / Math.max(scale.step, 0.001));

  for (let step = 1; step <= steps; step++) {
    const radius = (step / steps) * maxRadius;
    levels.push(getPolygonVertices(sides, radius, cx, cy));
  }

  return levels;
}

/**
 * Convert a data value to a radial distance (from center).
 * Clamps the value to [scale.min, scale.max].
 */
export function valueToRadius(
  value: number,
  scale: ScaleConfig,
  maxRadius: number
): number {
  const clamped = Math.max(scale.min, Math.min(scale.max, value));
  const range = scale.max - scale.min;
  if (range === 0) return 0;
  return ((clamped - scale.min) / range) * maxRadius;
}

/**
 * Calculate the (x, y) position of a data point for series[dimIndex].
 */
export function getDataPoint(
  value: number,
  dimIndex: number,
  totalDimensions: number,
  scale: ScaleConfig,
  maxRadius: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const radius = valueToRadius(value, scale, maxRadius);
  const angle = getAxisAngle(dimIndex, totalDimensions);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/**
 * Calculate all data points for a series and return them.
 */
export function getSeriesPoints(
  values: number[],
  scale: ScaleConfig,
  maxRadius: number,
  cx: number,
  cy: number
): { x: number; y: number }[] {
  return values.map((value, i) =>
    getDataPoint(value, i, values.length, scale, maxRadius, cx, cy)
  );
}

/**
 * Convert an array of (x, y) points to an SVG polygon points string.
 */
export function pointsToSvgString(
  points: { x: number; y: number }[]
): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Get the text-anchor and dominant-baseline for a label placed at a given angle.
 * This ensures labels are positioned legibly around the polygon perimeter.
 */
export function getLabelAlignment(angle: number): {
  textAnchor: string;
  dominantBaseline: string;
} {
  // Normalize angle to [0, 360)
  const deg = ((angle * 180) / Math.PI + 360) % 360;

  let textAnchor = "middle";
  if (deg > 10 && deg < 170) textAnchor = "start";
  else if (deg > 190 && deg < 350) textAnchor = "end";

  let dominantBaseline = "middle";
  if (deg > 260 && deg < 280) dominantBaseline = "auto";
  else if (deg > 80 && deg < 100) dominantBaseline = "hanging";

  return { textAnchor, dominantBaseline };
}

/**
 * Calculate the outer label position for a dimension axis.
 * Adds a small offset beyond the max polygon radius.
 */
export function getLabelPosition(
  dimIndex: number,
  totalDimensions: number,
  maxRadius: number,
  cx: number,
  cy: number,
  offset = 20
): { x: number; y: number; angle: number } {
  const angle = getAxisAngle(dimIndex, totalDimensions);
  return {
    x: cx + (maxRadius + offset) * Math.cos(angle),
    y: cy + (maxRadius + offset) * Math.sin(angle),
    angle,
  };
}

/**
 * Get the scale label value for a given concentric level.
 */
export function getScaleLabelValue(
  levelIndex: number,
  totalLevels: number,
  scale: ScaleConfig
): number {
  return scale.min + ((levelIndex + 1) / totalLevels) * (scale.max - scale.min);
}
