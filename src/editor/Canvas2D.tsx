import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Stage, Text, Group, Rect, Circle } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import {
  formatLength,
  midpoint,
  openingPolygon,
  projectPointOnSegment,
  snapPoint,
  SNAP_STEP_IMPERIAL,
  SNAP_STEP_METRIC,
  clamp,
} from '../utils/geometry';
import type { Point } from '../utils/geometry';
import { useBlueprintStore } from '../state/store';
import type { Wall, Opening, BlueprintProject } from '../state/store';

const defaultWidth = 3;
const defaultWindowWidth = 4;

interface DragWallState {
  type: 'wall';
  id: string;
  last: Point;
  snapshot: BlueprintProject;
}

interface DragHandleState {
  type: 'handle';
  id: string;
  handle: 'a' | 'b';
  snapshot: BlueprintProject;
}

type DragState = DragWallState | DragHandleState | null;

const useStageDimensions = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    const node = containerRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { containerRef, dimensions } as const;
};

const getWorldPoint = (stage: Konva.Stage | null) => {
  if (!stage) return null;
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  return transform.point(pointer) as Point;
};

const Canvas2D = () => {
  const { containerRef, dimensions } = useStageDimensions();
  const stageRef = useRef<Konva.Stage | null>(null);
  const [draft, setDraft] = useState<{ start: Point; end: Point | null } | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [panState, setPanState] = useState<
    | { active: boolean; pointer: { x: number; y: number }; panStart: { x: number; y: number } }
    | null
  >(null);

  const units = useBlueprintStore((state) => state.units);
  const activeFloorId = useBlueprintStore((state) => state.activeFloorId);
  const walls = useBlueprintStore((state) => state.walls);
  const openings = useBlueprintStore((state) => state.openings);
  const selection = useBlueprintStore((state) => state.selection);
  const tool = useBlueprintStore((state) => state.tool);
  const stageState = useBlueprintStore((state) => state.stage);
  const addWall = useBlueprintStore((state) => state.addWall);
  const moveWallPoint = useBlueprintStore((state) => state.moveWallPoint);
  const moveWall = useBlueprintStore((state) => state.moveWall);
  const addOpening = useBlueprintStore((state) => state.addOpening);
  const select = useBlueprintStore((state) => state.select);
  const clearSelection = useBlueprintStore((state) => state.clearSelection);
  const deleteSelection = useBlueprintStore((state) => state.deleteSelection);
  const undo = useBlueprintStore((state) => state.undo);
  const redo = useBlueprintStore((state) => state.redo);
  const setStage = useBlueprintStore((state) => state.setStage);
  const beginInteraction = useBlueprintStore((state) => state.beginInteraction);
  const commitInteraction = useBlueprintStore((state) => state.commitInteraction);

  const activeWalls = useMemo(
    () => Object.values(walls).filter((wall) => wall.levelId === activeFloorId),
    [walls, activeFloorId],
  );
  const wallOpenings = useMemo(() => Object.values(openings), [openings]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelection();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelection]);

  const gridLines = useMemo(() => {
    const spacing = units === 'imperial' ? SNAP_STEP_IMPERIAL : SNAP_STEP_METRIC;
    const majorEvery = 5;
    const scale = stageState.scale;
    const pan = stageState.pan;
    const width = dimensions.width;
    const height = dimensions.height;
    const minX = (-pan.x) / scale;
    const maxX = (width - pan.x) / scale;
    const minY = (-pan.y) / scale;
    const maxY = (height - pan.y) / scale;

    const vertical: { x: number; major: boolean }[] = [];
    const horizontal: { y: number; major: boolean }[] = [];

    const startX = Math.floor(minX / spacing) * spacing;
    const endX = Math.ceil(maxX / spacing) * spacing;
    for (let x = startX; x <= endX; x += spacing) {
      const index = Math.round(x / spacing);
      vertical.push({ x, major: index % majorEvery === 0 });
    }

    const startY = Math.floor(minY / spacing) * spacing;
    const endY = Math.ceil(maxY / spacing) * spacing;
    for (let y = startY; y <= endY; y += spacing) {
      const index = Math.round(y / spacing);
      horizontal.push({ y, major: index % majorEvery === 0 });
    }

    return { vertical, horizontal };
  }, [units, stageState.scale, stageState.pan, dimensions.width, dimensions.height]);

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = getWorldPoint(stage);
    if (!pointer) return;
    const scaleBy = 1.08;
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const oldScale = stageState.scale;
    const newScale = clamp(direction > 0 ? oldScale * scaleBy : oldScale / scaleBy, 8, 128);
    const screenPointer = stage.getPointerPosition();
    if (!screenPointer) return;
    const newPan = {
      x: screenPointer.x - pointer.x * newScale,
      y: screenPointer.y - pointer.y * newScale,
    };
    setStage({ pan: newPan, scale: newScale });
  };

  const findWallAtPoint = (point: Point): { wall: Wall; offset: number } | null => {
    let closestWall: Wall | null = null;
    let closestOffset = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    activeWalls.forEach((wall) => {
      const projection = projectPointOnSegment(point, wall.a, wall.b);
      const length = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y);
      const distanceToWall = projection.distance;
      const tolerance = Math.max(wall.thickness, 0.75);
      if (distanceToWall <= tolerance) {
        if (distanceToWall < closestDistance) {
          closestDistance = distanceToWall;
          closestWall = wall;
          closestOffset = projection.t * length;
        }
      }
    });
    if (!closestWall) return null;
    return { wall: closestWall, offset: closestOffset };
  };

  const handleStageMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (event.evt.button === 1 || event.evt.button === 2 || event.evt.altKey) {
      event.evt.preventDefault();
      const pointer = { x: event.evt.clientX, y: event.evt.clientY };
      setPanState({ active: true, pointer, panStart: { ...stageState.pan } });
      return;
    }

    const world = getWorldPoint(stage);
    if (!world) return;

    if (tool === 'wall') {
      event.evt.preventDefault();
      if (!draft) {
        setDraft({ start: snapPoint(world, units), end: null });
      } else {
        addWall(draft.start, world);
        setDraft(null);
      }
      return;
    }

    if (tool === 'door' || tool === 'window') {
      const hit = findWallAtPoint(world);
      if (hit) {
        const width = tool === 'door' ? defaultWidth : defaultWindowWidth;
        addOpening(hit.wall.id, tool, hit.offset, width);
      }
      return;
    }

    if (tool === 'select' && event.target === stage) {
      clearSelection();
    }
  };

  const handleStageMouseMove = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const world = getWorldPoint(stage);
    if (panState?.active) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const deltaX = pointer.x - panState.pointer.x;
      const deltaY = pointer.y - panState.pointer.y;
      setStage({ pan: { x: panState.panStart.x + deltaX, y: panState.panStart.y + deltaY } });
      return;
    }

    if (draft && world) {
      setDraft({ start: draft.start, end: snapPoint(world, units) });
    }

    if (!world) return;

    if (dragState?.type === 'wall') {
      const delta = { x: world.x - dragState.last.x, y: world.y - dragState.last.y };
      if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
        moveWall(dragState.id, delta, false);
        setDragState({ ...dragState, last: world });
      }
    } else if (dragState?.type === 'handle') {
      moveWallPoint(dragState.id, dragState.handle, world, false);
    }
  };

  const endDrag = () => {
    if (dragState) {
      commitInteraction(dragState.snapshot);
      setDragState(null);
    }
  };

  const handleStageMouseUp = () => {
    if (panState?.active) {
      setPanState(null);
    }
    endDrag();
  };

  const handleWallPointerDown = (wall: Wall) => (event: KonvaEventObject<MouseEvent>) => {
    if (tool !== 'select') return;
    event.cancelBubble = true;
    const stage = stageRef.current;
    if (!stage) return;
    const world = getWorldPoint(stage);
    if (!world) return;
    select({ type: 'wall', id: wall.id });
    if (event.evt.button === 0) {
      const snapshot = beginInteraction();
      setDragState({ type: 'wall', id: wall.id, last: world, snapshot });
    }
  };

  const handleHandlePointerDown = (wall: Wall, handle: 'a' | 'b') =>
    (event: KonvaEventObject<MouseEvent>) => {
      if (tool !== 'select') return;
      event.cancelBubble = true;
      const stage = stageRef.current;
      if (!stage) return;
      const world = getWorldPoint(stage);
      if (!world) return;
      select({ type: 'wall', id: wall.id });
      const snapshot = beginInteraction();
      moveWallPoint(wall.id, handle, world, false);
      setDragState({ type: 'handle', id: wall.id, handle, snapshot });
    };

  const handleOpeningPointerDown = (opening: Opening) => (event: KonvaEventObject<MouseEvent>) => {
    if (tool !== 'select') return;
    event.cancelBubble = true;
    select({ type: 'opening', id: opening.id });
  };

  return (
    <div ref={containerRef} className="canvas2d">
      <Stage
        ref={(node) => {
          stageRef.current = node;
        }}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        x={stageState.pan.x}
        y={stageState.pan.y}
        draggable={false}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={endDrag}
        onContextMenu={(event) => event.evt.preventDefault()}
        listening
      >
        <Layer>
          <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#0f172a" />
          {gridLines.vertical.map(({ x, major }) => (
            <Line key={`v-${x}`} points={[x, -10000, x, 10000]} stroke={major ? '#1e293b' : '#16203a'} strokeWidth={major ? 0.1 : 0.05} />
          ))}
          {gridLines.horizontal.map(({ y, major }) => (
            <Line key={`h-${y}`} points={[-10000, y, 10000, y]} stroke={major ? '#1e293b' : '#16203a'} strokeWidth={major ? 0.1 : 0.05} />
          ))}
          {draft?.end && (
            <Line
              points={[draft.start.x, draft.start.y, draft.end.x, draft.end.y]}
              stroke="#38bdf8"
              strokeWidth={0.2}
              dash={[0.5, 0.5]}
            />
          )}
          {activeWalls.map((wall) => {
            const isSelected = selection.type === 'wall' && selection.id === wall.id;
            const wallOpeningsForWall = wallOpenings.filter((opening) => opening.wallId === wall.id);
            const length = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y);
            const angle = Math.atan2(wall.b.y - wall.a.y, wall.b.x - wall.a.x);
            const normal = { x: -(wall.b.y - wall.a.y), y: wall.b.x - wall.a.x };
            const normalLength = Math.hypot(normal.x, normal.y) || 1;
            const offset = {
              x: (normal.x / normalLength) * (0.35 + wall.thickness / 2),
              y: (normal.y / normalLength) * (0.35 + wall.thickness / 2),
            };
            const mid = midpoint(wall.a, wall.b);

            return (
              <Group key={wall.id}>
                <Line
                  points={[wall.a.x, wall.a.y, wall.b.x, wall.b.y]}
                  stroke={isSelected ? '#f97316' : '#e2e8f0'}
                  strokeWidth={wall.thickness}
                  lineCap="round"
                  listening
                  hitStrokeWidth={1}
                  onMouseDown={handleWallPointerDown(wall)}
                  onMouseEnter={(event) => {
                    if (tool === 'door' || tool === 'window') {
                      const container = event.target.getStage()?.container();
                      if (container) container.style.cursor = 'crosshair';
                    }
                  }}
                  onMouseLeave={(event) => {
                    const container = event.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                />
                {wallOpeningsForWall.map((opening) => {
                  const polygon = openingPolygon(wall, opening);
                  const flat = polygon.flatMap((point) => [point.x, point.y]);
                  const openingSelected = selection.type === 'opening' && selection.id === opening.id;
                  return (
                    <Line
                      key={opening.id}
                      points={flat}
                      closed
                      stroke={openingSelected ? '#f97316' : '#0f172a'}
                      strokeWidth={0.05}
                      fill={opening.type === 'door' ? 'rgba(45,212,191,0.6)' : 'rgba(96,165,250,0.6)'}
                      listening
                      onMouseDown={handleOpeningPointerDown(opening)}
                    />
                  );
                })}
                <Text
                  text={formatLength(length, units)}
                  x={mid.x + offset.x}
                  y={mid.y + offset.y}
                  fontSize={0.6}
                  fill="#94a3b8"
                  rotation={(angle * 180) / Math.PI}
                />
                {isSelected && (
                  <>
                    <Circle
                      x={wall.a.x}
                      y={wall.a.y}
                      radius={0.25}
                      fill="#fbbf24"
                      stroke="#0f172a"
                      strokeWidth={0.05}
                      onMouseDown={handleHandlePointerDown(wall, 'a')}
                    />
                    <Circle
                      x={wall.b.x}
                      y={wall.b.y}
                      radius={0.25}
                      fill="#fbbf24"
                      stroke="#0f172a"
                      strokeWidth={0.05}
                      onMouseDown={handleHandlePointerDown(wall, 'b')}
                    />
                    <Rect
                      x={mid.x - 0.35}
                      y={mid.y - 0.35}
                      width={0.7}
                      height={0.7}
                      cornerRadius={0.15}
                      fill="rgba(251,191,36,0.8)"
                      stroke="#0f172a"
                      strokeWidth={0.05}
                      listening
                      onMouseDown={handleWallPointerDown(wall)}
                    />
                  </>
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas2D;
