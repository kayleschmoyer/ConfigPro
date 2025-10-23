import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { produce } from 'immer';
import type { Units, Point } from '../utils/geometry';
import { snapPoint, snapValue, distance, clamp } from '../utils/geometry';

export type Tool = 'select' | 'wall' | 'door' | 'window';

export interface Wall {
  id: string;
  a: Point;
  b: Point;
  thickness: number;
  levelId: string;
}

export type OpeningType = 'door' | 'window';

export interface Opening {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  height: number;
  sill: number;
  type: OpeningType;
}

export interface Floor {
  id: string;
  name: string;
  elevation: number;
  height: number;
}

export interface StageState {
  pan: Point;
  scale: number;
}

export interface BlueprintProject {
  floors: Floor[];
  walls: Wall[];
  openings: Opening[];
  units: Units;
  activeFloorId: string;
}

interface HistoryStack {
  past: BlueprintProject[];
  future: BlueprintProject[];
}

interface SelectionState {
  type: 'wall' | 'opening' | null;
  id: string | null;
}

interface BlueprintState {
  floors: Floor[];
  walls: Record<string, Wall>;
  openings: Record<string, Opening>;
  activeFloorId: string;
  selection: SelectionState;
  tool: Tool;
  units: Units;
  stage: StageState;
  preview3D: boolean;
  history: HistoryStack;
  addWall: (a: Point, b: Point, thickness?: number) => void;
  moveWallPoint: (wallId: string, point: 'a' | 'b', value: Point, commit?: boolean) => void;
  moveWall: (wallId: string, delta: Point, commit?: boolean) => void;
  addOpening: (wallId: string, type: OpeningType, offset: number, width: number) => void;
  updateOpening: (openingId: string, patch: Partial<Pick<Opening, 'offset' | 'width' | 'height' | 'sill'>>) => void;
  deleteSelection: () => void;
  select: (selection: SelectionState) => void;
  clearSelection: () => void;
  setTool: (tool: Tool) => void;
  setUnits: (units: Units) => void;
  toggleUnits: () => void;
  addFloor: () => void;
  removeFloor: (floorId: string) => void;
  setActiveFloor: (floorId: string) => void;
  setFloorHeight: (floorId: string, height: number) => void;
  setStage: (stage: Partial<StageState>) => void;
  setPreview3D: (value: boolean) => void;
  undo: () => void;
  redo: () => void;
  exportProject: () => BlueprintProject;
  importProject: (project: BlueprintProject) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  beginInteraction: () => BlueprintProject;
  commitInteraction: (snapshot: BlueprintProject) => void;
}

const LOCAL_STORAGE_KEY = 'blueprint-project';

const imperialThickness = 0.5;
const metricThickness = 0.328084;

const createInitialFloors = (): Floor[] => [
  {
    id: nanoid(),
    name: 'Level 1',
    elevation: 0,
    height: 10,
  },
];

const createSnapshot = (state: BlueprintState): BlueprintProject => ({
  floors: state.floors.map((floor) => ({ ...floor })),
  walls: Object.values(state.walls).map((wall) => ({
    ...wall,
    a: { ...wall.a },
    b: { ...wall.b },
  })),
  openings: Object.values(state.openings).map((opening) => ({ ...opening })),
  units: state.units,
  activeFloorId: state.activeFloorId,
});

const applySnapshot = (state: BlueprintState, snapshot: BlueprintProject) => {
  state.floors = snapshot.floors.map((floor) => ({ ...floor }));
  state.walls = snapshot.walls.reduce<Record<string, Wall>>((acc, wall) => {
    acc[wall.id] = {
      ...wall,
      a: { ...wall.a },
      b: { ...wall.b },
    };
    return acc;
  }, {});
  state.openings = snapshot.openings.reduce<Record<string, Opening>>((acc, opening) => {
    acc[opening.id] = { ...opening };
    return acc;
  }, {});
  state.units = snapshot.units;
  state.activeFloorId = snapshot.activeFloorId;
  state.selection = { type: null, id: null };
};

const clampOpening = (opening: Opening, wall: Wall) => {
  const length = distance(wall.a, wall.b);
  if (length <= 0) {
    opening.offset = 0;
    opening.width = 0;
    return;
  }
  opening.width = clamp(opening.width, 0, length);
  opening.offset = clamp(opening.offset, 0, Math.max(length - opening.width, 0));
};

export const useBlueprintStore = create<BlueprintState>()((set, get) => {
  const floors = createInitialFloors();
  const defaultFloor = floors[0];

  return {
    floors,
    walls: {},
    openings: {},
    activeFloorId: defaultFloor.id,
    selection: { type: null, id: null },
    tool: 'wall',
    units: 'imperial',
    stage: {
      pan: { x: 400, y: 300 },
      scale: 32,
    },
    preview3D: true,
    history: { past: [], future: [] },
    addWall: (a, b, thickness) => {
      const wallThickness = thickness ?? (get().units === 'imperial' ? imperialThickness : metricThickness);
      const snappedA = snapPoint(a, get().units);
      const snappedB = snapPoint(b, get().units);
      if (distance(snappedA, snappedB) === 0) return;
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          const id = nanoid();
          draft.walls[id] = {
            id,
            a: snappedA,
            b: snappedB,
            thickness: wallThickness,
            levelId: draft.activeFloorId,
          };
          draft.history.past.push(snapshot);
          draft.history.future = [];
          draft.selection = { type: 'wall', id };
        }),
      );
    },
    moveWallPoint: (wallId, pointKey, value, commit = true) => {
      const units = get().units;
      const snapped = snapPoint(value, units);
      const wall = get().walls[wallId];
      if (!wall) return;
      const oldLength = distance(wall.a, wall.b);
      const updater = (draft: BlueprintState) => {
        const target = draft.walls[wallId];
        if (!target) return;
        target[pointKey] = snapped;
        const newLength = distance(target.a, target.b);
        Object.values(draft.openings)
          .filter((opening) => opening.wallId === wallId)
          .forEach((opening) => {
            if (oldLength > 0 && newLength > 0) {
              const ratio = clamp(opening.offset / oldLength, 0, 1);
              opening.offset = ratio * newLength;
            }
            clampOpening(opening, target);
          });
      };

      if (commit) {
        const snapshot = createSnapshot(get());
        set((state) =>
          produce(state, (draft) => {
            updater(draft);
            draft.history.past.push(snapshot);
            draft.history.future = [];
          }),
        );
      } else {
        set((state) => produce(state, (draft) => updater(draft)));
      }
    },
    moveWall: (wallId, delta, commit = true) => {
      const wall = get().walls[wallId];
      if (!wall) return;
      const units = get().units;
      const nextA = snapPoint({ x: wall.a.x + delta.x, y: wall.a.y + delta.y }, units);
      const nextB = snapPoint({ x: wall.b.x + delta.x, y: wall.b.y + delta.y }, units);
      const snappedDelta = { x: nextA.x - wall.a.x, y: nextA.y - wall.a.y };
      const updater = (draft: BlueprintState) => {
        const target = draft.walls[wallId];
        if (!target) return;
        target.a = { x: target.a.x + snappedDelta.x, y: target.a.y + snappedDelta.y };
        target.b = { x: target.b.x + (nextB.x - wall.b.x), y: target.b.y + (nextB.y - wall.b.y) };
      };
      if (commit) {
        const snapshot = createSnapshot(get());
        set((state) =>
          produce(state, (draft) => {
            updater(draft);
            draft.history.past.push(snapshot);
            draft.history.future = [];
          }),
        );
      } else {
        set((state) => produce(state, (draft) => updater(draft)));
      }
    },
    addOpening: (wallId, type, offset, width) => {
      const wall = get().walls[wallId];
      if (!wall) return;
      const snapshot = createSnapshot(get());
      const snappedOffset = snapValue(offset, get().units);
      const snappedWidth = Math.max(snapValue(width, get().units), 0);
      set((state) =>
        produce(state, (draft) => {
          const targetWall = draft.walls[wallId];
          if (!targetWall) return;
          const id = nanoid();
          const opening: Opening = {
            id,
            wallId,
            offset: snappedOffset,
            width: snappedWidth,
            height: type === 'door' ? 7 : 4,
            sill: type === 'door' ? 0 : 3,
            type,
          };
          clampOpening(opening, targetWall);
          draft.openings[id] = opening;
          draft.history.past.push(snapshot);
          draft.history.future = [];
          draft.selection = { type: 'opening', id };
        }),
      );
    },
    updateOpening: (openingId, patch) => {
      if (!get().openings[openingId]) return;
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          const opening = draft.openings[openingId];
          if (!opening) return;
          Object.assign(opening, patch);
          const wall = draft.walls[opening.wallId];
          if (wall) {
            clampOpening(opening, wall);
          }
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
    deleteSelection: () => {
      const { selection } = get();
      if (!selection.type || !selection.id) return;
      const selectionId = selection.id;
      const selectionType = selection.type;
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          if (selectionType === 'wall') {
            delete draft.walls[selectionId];
            Object.keys(draft.openings).forEach((id) => {
              if (draft.openings[id]?.wallId === selectionId) {
                delete draft.openings[id];
              }
            });
          } else if (selectionType === 'opening') {
            delete draft.openings[selectionId];
          }
          draft.history.past.push(snapshot);
          draft.history.future = [];
          draft.selection = { type: null, id: null };
        }),
      );
    },
    select: (selection) => {
      set((state) =>
        produce(state, (draft) => {
          draft.selection = selection;
        }),
      );
    },
    clearSelection: () => {
      set((state) =>
        produce(state, (draft) => {
          draft.selection = { type: null, id: null };
        }),
      );
    },
    setTool: (tool) => {
      set((state) =>
        produce(state, (draft) => {
          draft.tool = tool;
        }),
      );
    },
    setUnits: (units) => {
      set((state) =>
        produce(state, (draft) => {
          draft.units = units;
        }),
      );
    },
    toggleUnits: () => {
      const next = get().units === 'imperial' ? 'metric' : 'imperial';
      set((state) =>
        produce(state, (draft) => {
          draft.units = next;
        }),
      );
    },
    addFloor: () => {
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          const previous = draft.floors[draft.floors.length - 1];
          const newFloor: Floor = {
            id: nanoid(),
            name: `Level ${draft.floors.length + 1}`,
            elevation: (previous?.elevation ?? 0) + (previous?.height ?? 10),
            height: previous?.height ?? 10,
          };
          draft.floors.push(newFloor);
          draft.activeFloorId = newFloor.id;
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
    removeFloor: (floorId) => {
      const state = get();
      if (state.floors.length <= 1) return;
      const snapshot = createSnapshot(state);
      set((draftState) =>
        produce(draftState, (draft) => {
          draft.floors = draft.floors.filter((floor) => floor.id !== floorId);
          Object.keys(draft.walls).forEach((id) => {
            if (draft.walls[id]?.levelId === floorId) {
              delete draft.walls[id];
              Object.keys(draft.openings).forEach((openingId) => {
                if (draft.openings[openingId]?.wallId === id) {
                  delete draft.openings[openingId];
                }
              });
            }
          });
          if (draft.activeFloorId === floorId) {
            draft.activeFloorId = draft.floors[0]?.id ?? '';
          }
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
    setActiveFloor: (floorId) => {
      set((state) =>
        produce(state, (draft) => {
          draft.activeFloorId = floorId;
          draft.selection = { type: null, id: null };
        }),
      );
    },
    setFloorHeight: (floorId, height) => {
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          const floor = draft.floors.find((f) => f.id === floorId);
          if (!floor) return;
          floor.height = Math.max(height, 0);
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
    setStage: (stage) => {
      set((state) =>
        produce(state, (draft) => {
          draft.stage = {
            pan: stage.pan ? { ...stage.pan } : draft.stage.pan,
            scale: stage.scale ?? draft.stage.scale,
          };
        }),
      );
    },
    setPreview3D: (value) => {
      set((state) =>
        produce(state, (draft) => {
          draft.preview3D = value;
        }),
      );
    },
    undo: () => {
      const { history } = get();
      if (!history.past.length) return;
      const past = [...history.past];
      const snapshot = past.pop()!;
      const currentSnapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          draft.history.past = past;
          draft.history.future = [currentSnapshot, ...draft.history.future];
          applySnapshot(draft, snapshot);
        }),
      );
    },
    redo: () => {
      const { history } = get();
      if (!history.future.length) return;
      const [next, ...rest] = history.future;
      const currentSnapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          draft.history.future = rest;
          draft.history.past = [...draft.history.past, currentSnapshot];
          applySnapshot(draft, next);
        }),
      );
    },
    exportProject: () => createSnapshot(get()),
    importProject: (project) => {
      const snapshot = createSnapshot(get());
      set((state) =>
        produce(state, (draft) => {
          applySnapshot(draft, project);
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
    saveToLocalStorage: () => {
      if (typeof window === 'undefined') return;
      const project = createSnapshot(get());
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
    },
    loadFromLocalStorage: () => {
      if (typeof window === 'undefined') return false;
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw) as BlueprintProject;
        set((state) =>
          produce(state, (draft) => {
            applySnapshot(draft, parsed);
            draft.history = { past: [], future: [] };
          }),
        );
        return true;
      } catch (error) {
        console.error('Failed to load project', error);
        return false;
      }
    },
    beginInteraction: () => createSnapshot(get()),
    commitInteraction: (snapshot) => {
      set((state) =>
        produce(state, (draft) => {
          draft.history.past.push(snapshot);
          draft.history.future = [];
        }),
      );
    },
  };
});

export type BlueprintStore = ReturnType<typeof useBlueprintStore.getState>;
