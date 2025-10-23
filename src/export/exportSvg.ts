import type { BlueprintProject, Wall } from '../state/store';

const PIXELS_PER_FOOT = 40;
const PADDING = 20;

type OpeningLookup = Record<string, { offset: number; width: number; type: string }[]>;

const collectWalls = (project: BlueprintProject, floorId: string) =>
  project.walls.filter((wall) => wall.levelId === floorId);

const collectOpenings = (project: BlueprintProject): OpeningLookup => {
  return project.openings.reduce<OpeningLookup>((acc, opening) => {
    if (!acc[opening.wallId]) {
      acc[opening.wallId] = [];
    }
    acc[opening.wallId].push({ offset: opening.offset, width: opening.width, type: opening.type });
    return acc;
  }, {});
};

const boundsForWalls = (walls: Wall[]) => {
  if (!walls.length) {
    return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  walls.forEach((wall) => {
    [wall.a, wall.b].forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
  });
  return { minX, maxX, minY, maxY };
};

const toScreen = (value: number) => value * PIXELS_PER_FOOT;

export const exportSvg = (project: BlueprintProject, floorId: string, filename = 'blueprint.svg') => {
  const walls = collectWalls(project, floorId);
  const openings = collectOpenings(project);
  const bounds = boundsForWalls(walls);
  const widthFeet = bounds.maxX - bounds.minX;
  const heightFeet = bounds.maxY - bounds.minY;
  const width = toScreen(widthFeet) + PADDING * 2;
  const height = toScreen(heightFeet) + PADDING * 2;

  const mapX = (value: number) => toScreen(value - bounds.minX) + PADDING;
  const mapY = (value: number) => height - (toScreen(value - bounds.minY) + PADDING);

  const wallElements = walls
    .map((wall) => {
      const x1 = mapX(wall.a.x);
      const y1 = mapY(wall.a.y);
      const x2 = mapX(wall.b.x);
      const y2 = mapY(wall.b.y);
      const strokeWidth = Math.max(1, toScreen(wall.thickness));
      const wallSvg = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1f2937" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
      const openingSvg = (openings[wall.id] ?? [])
        .map((opening) => {
          const length = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y);
          if (length === 0) return '';
          const ratioStart = opening.offset / length;
          const ratioEnd = Math.min(1, (opening.offset + opening.width) / length);
          const startX = wall.a.x + (wall.b.x - wall.a.x) * ratioStart;
          const startY = wall.a.y + (wall.b.y - wall.a.y) * ratioStart;
          const endX = wall.a.x + (wall.b.x - wall.a.x) * ratioEnd;
          const endY = wall.a.y + (wall.b.y - wall.a.y) * ratioEnd;
          const openingWidth = Math.max(2, toScreen(wall.thickness) * 0.6);
          return `<line x1="${mapX(startX)}" y1="${mapY(startY)}" x2="${mapX(endX)}" y2="${mapY(endY)}" stroke="${
            opening.type === 'door' ? '#0f766e' : '#1d4ed8'
          }" stroke-width="${openingWidth}" stroke-linecap="butt" />`;
        })
        .join('');
      return wallSvg + openingSvg;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#f8fafc" />
  ${wallElements}
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
