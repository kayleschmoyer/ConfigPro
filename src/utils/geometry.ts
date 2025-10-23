export type Units = 'imperial' | 'metric';

export interface Point {
  x: number;
  y: number;
}

export interface ProjectionResult {
  point: Point;
  distance: number;
  t: number;
}

export const FEET_TO_METERS = 0.3048;
export const SNAP_STEP_IMPERIAL = 0.5;
export const SNAP_STEP_METRIC = 0.328084; // 10 cm in feet

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const snapValue = (value: number, units: Units) => {
  const step = units === 'imperial' ? SNAP_STEP_IMPERIAL : SNAP_STEP_METRIC;
  return Math.round(value / step) * step;
};

export const snapPoint = (point: Point, units: Units): Point => ({
  x: snapValue(point.x, units),
  y: snapValue(point.y, units),
});

export const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

export const angleBetweenPoints = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);

export const pointAlongSegment = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const projectPointOnSegment = (point: Point, a: Point, b: Point): ProjectionResult => {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const abLengthSq = ab.x * ab.x + ab.y * ab.y;
  if (abLengthSq === 0) {
    return { point: { ...a }, distance: distance(point, a), t: 0 };
  }
  const ap = { x: point.x - a.x, y: point.y - a.y };
  let t = (ap.x * ab.x + ap.y * ab.y) / abLengthSq;
  t = clamp(t, 0, 1);
  const projected = pointAlongSegment(a, b, t);
  return {
    point: projected,
    distance: distance(point, projected),
    t,
  };
};

export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const normalised = (vector: Point): Point => {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
};

export const perpendicular = (vector: Point): Point => ({ x: -vector.y, y: vector.x });

export const openingPolygon = (
  wall: { a: Point; b: Point; thickness: number },
  opening: { offset: number; width: number },
): Point[] => {
  const direction = { x: wall.b.x - wall.a.x, y: wall.b.y - wall.a.y };
  const length = Math.hypot(direction.x, direction.y);
  if (length === 0) return [];
  const dir = { x: direction.x / length, y: direction.y / length };
  const normal = normalised(perpendicular(direction));
  const halfThickness = wall.thickness / 2;
  const start = {
    x: wall.a.x + dir.x * opening.offset,
    y: wall.a.y + dir.y * opening.offset,
  };
  const end = {
    x: start.x + dir.x * opening.width,
    y: start.y + dir.y * opening.width,
  };
  return [
    { x: start.x + normal.x * halfThickness, y: start.y + normal.y * halfThickness },
    { x: end.x + normal.x * halfThickness, y: end.y + normal.y * halfThickness },
    { x: end.x - normal.x * halfThickness, y: end.y - normal.y * halfThickness },
    { x: start.x - normal.x * halfThickness, y: start.y - normal.y * halfThickness },
  ];
};

export const isPointNearSegment = (point: Point, a: Point, b: Point, tolerance: number) => {
  const { distance: d } = projectPointOnSegment(point, a, b);
  return d <= tolerance;
};

export const formatLength = (valueInFeet: number, units: Units) => {
  if (units === 'imperial') {
    return `${valueInFeet.toFixed(2)} ft`;
  }
  const meters = valueInFeet * FEET_TO_METERS;
  return `${meters.toFixed(2)} m`;
};

export const toUnitsValue = (valueInFeet: number, units: Units) =>
  units === 'imperial' ? valueInFeet : valueInFeet * FEET_TO_METERS;

export const fromUnitsValue = (value: number, units: Units) =>
  units === 'imperial' ? value : value / FEET_TO_METERS;
