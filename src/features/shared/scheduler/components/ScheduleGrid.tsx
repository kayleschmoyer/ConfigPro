import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, UIEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import type { GridGrouping, ScheduleView, Shift, Violation } from '../lib/types';
import type { HeatmapEntry, ScheduleColumn, ScheduleRow, ShiftTemplate, ShiftWithMeta } from '../hooks/useSchedule';
import { ShiftCard } from './ShiftCard';
import { CoverageOverlay } from './CoverageOverlay';

const ROW_HEADER_WIDTH = 220;
const COLUMN_MIN_WIDTH = 220;
const MINUTES_PER_DAY = 24 * 60;

const toISOFromDay = (day: string, minutes: number) => {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCMinutes(minutes);
  return date.toISOString();
};

const minutesFromISO = (iso: string) => {
  const date = new Date(iso);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

type DragKind = 'move' | 'resize';

type DragState = {
  type: DragKind;
  direction?: 'left' | 'right';
  shiftId: string;
  pointerId: number;
  startX: number;
  originalDayIndex: number;
  originalStartMinutes: number;
  originalEndMinutes: number;
  originalTotalStart: number;
  originalTotalEnd: number;
  originalShift: ShiftWithMeta;
};

export type ScheduleGridProps = {
  columns: ScheduleColumn[];
  rows: ScheduleRow[];
  shifts: ShiftWithMeta[];
  view: ScheduleView;
  grouping: GridGrouping;
  rowHeight: number;
  timeIncrement: number;
  selectedShiftId: string | null;
  onSelectShift: (shiftId: string | null) => void;
  onBeginCreateShift: (args: { rowId: string; date: string; startMinutes: number; endMinutes: number }) => void;
  onBeginEditShift: (shiftId: string) => void;
  onSaveShift: (shift: Shift) => void;
  evaluateShift: (shift: Shift) => Violation[];
  onPreview: (violations: Violation[] | null) => void;
  preview: Violation[] | null;
  coverageHeatmap: Record<string, HeatmapEntry>;
  templates: ShiftTemplate[];
  applyTemplate: (templateId: string, target: { rowId: string; date: string }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};
export const ScheduleGrid = ({
  columns,
  rows,
  shifts,
  view,
  grouping,
  rowHeight,
  timeIncrement,
  selectedShiftId,
  onSelectShift,
  onBeginCreateShift,
  onBeginEditShift,
  onSaveShift,
  evaluateShift,
  onPreview,
  preview,
  coverageHeatmap,
  templates,
  applyTemplate,
  undo,
  redo,
  canUndo,
  canRedo,
}: ScheduleGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidth, setColumnWidth] = useState(280);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pendingShift, setPendingShift] = useState<Shift | null>(null);
  const [dragPreview, setDragPreview] = useState<ShiftWithMeta | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateDimensions = () => {
      setViewportHeight(container.clientHeight);
      setScrollTop(container.scrollTop);
      const availableWidth = container.clientWidth - ROW_HEADER_WIDTH;
      const perColumn = columns.length ? Math.max(COLUMN_MIN_WIDTH, availableWidth / columns.length) : COLUMN_MIN_WIDTH;
      setColumnWidth(perColumn);
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, [columns.length]);

  const totalHeight = rows.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
  const visibleCount = Math.min(rows.length - startIndex, Math.ceil(viewportHeight / rowHeight) + 4);
  const visibleRows = rows.slice(startIndex, startIndex + visibleCount);
  const translateY = startIndex * rowHeight;
  const gridTemplateColumns = `${ROW_HEADER_WIDTH}px repeat(${columns.length}, ${columnWidth}px)`;

  const minuteIncrement = Math.max(timeIncrement, 5);

  const effectiveShifts = useMemo(() => {
    if (!dragPreview) return shifts;
    return [...shifts.filter((shift) => shift.id !== dragPreview.id), dragPreview];
  }, [dragPreview, shifts]);

  const shiftsByRow = useMemo(() => {
    const map = new Map<string, ShiftWithMeta[]>();
    for (const row of rows) {
      map.set(row.id, []);
    }
    effectiveShifts.forEach((shift) => {
      if (grouping === 'employee') {
        if (shift.employee?.id) {
          map.get(shift.employee.id)?.push(shift);
        }
      } else {
        map.get(shift.role?.id ?? '')?.push(shift);
      }
    });
    return map;
  }, [effectiveShifts, grouping, rows]);

  const minutesFromDelta = (deltaX: number) => {
    const ratio = deltaX / columnWidth;
    const minutes = ratio * MINUTES_PER_DAY;
    return Math.round(minutes / minuteIncrement) * minuteIncrement;
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState) return;
      const deltaMinutes = minutesFromDelta(event.clientX - dragState.startX);
      let dayIndex = dragState.originalDayIndex;
      let startMinutes = dragState.originalStartMinutes;
      let endMinutes = dragState.originalEndMinutes;
      let date = columns[dayIndex]?.date ?? columns[0]?.date ?? columns[columns.length - 1]?.date ?? '';

      if (dragState.type === 'move') {
        const totalDuration = dragState.originalTotalEnd - dragState.originalTotalStart;
        let totalStart = dragState.originalTotalStart + deltaMinutes;
        const maxStart = columns.length * MINUTES_PER_DAY - totalDuration;
        totalStart = Math.min(Math.max(0, totalStart), Math.max(0, maxStart));
        dayIndex = Math.floor(totalStart / MINUTES_PER_DAY);
        const column = columns[Math.min(dayIndex, columns.length - 1)];
        date = column?.date ?? date;
        startMinutes = totalStart - dayIndex * MINUTES_PER_DAY;
        endMinutes = startMinutes + totalDuration;
      } else if (dragState.direction === 'left') {
        const dayStart = dragState.originalDayIndex * MINUTES_PER_DAY;
        let newStart = dragState.originalTotalStart + deltaMinutes;
        newStart = Math.min(Math.max(dayStart, newStart), dragState.originalTotalEnd - minuteIncrement);
        dayIndex = dragState.originalDayIndex;
        date = columns[dayIndex]?.date ?? date;
        startMinutes = newStart - dayStart;
        endMinutes = dragState.originalTotalEnd - dayStart;
      } else if (dragState.direction === 'right') {
        const dayStart = dragState.originalDayIndex * MINUTES_PER_DAY;
        const dayEnd = dayStart + MINUTES_PER_DAY;
        let newEnd = dragState.originalTotalEnd + deltaMinutes;
        newEnd = Math.max(newEnd, dragState.originalTotalStart + minuteIncrement);
        newEnd = Math.min(newEnd, dayEnd);
        dayIndex = dragState.originalDayIndex;
        date = columns[dayIndex]?.date ?? date;
        startMinutes = dragState.originalTotalStart - dayStart;
        endMinutes = newEnd - dayStart;
      }

      startMinutes = Math.max(0, Math.min(startMinutes, MINUTES_PER_DAY - minuteIncrement));
      endMinutes = Math.max(startMinutes + minuteIncrement, Math.min(endMinutes, MINUTES_PER_DAY));

      const updatedShift: Shift = {
        ...dragState.originalShift,
        start: toISOFromDay(date, startMinutes),
        end: toISOFromDay(date, endMinutes),
      };
      const violations = evaluateShift(updatedShift);
      onPreview(violations);
      setPendingShift(updatedShift);
      setDragPreview({
        ...dragState.originalShift,
        ...updatedShift,
        violations,
        durationMinutes: endMinutes - startMinutes,
      });
    };

    const handlePointerUp = () => {
      if (pendingShift) {
        onSaveShift(pendingShift);
      }
      setDragState(null);
      setPendingShift(null);
      setDragPreview(null);
      onPreview(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [columns, dragState, evaluateShift, minuteIncrement, minutesFromDelta, onPreview, onSaveShift, pendingShift]);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollLeft(target.scrollLeft);
    setScrollTop(target.scrollTop);
  };

  const handleCellDoubleClick = (rowId: string, date: string, event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left + scrollLeft;
    const minutes = Math.max(0, Math.min(MINUTES_PER_DAY, (offsetX / columnWidth) * MINUTES_PER_DAY));
    const rounded = Math.round(minutes / minuteIncrement) * minuteIncrement;
    const duration = Math.max(4 * 60, minuteIncrement);
    const end = Math.min(MINUTES_PER_DAY, rounded + duration);
    onBeginCreateShift({ rowId, date, startMinutes: rounded, endMinutes: end });
  };

  const handleShiftPointerDown = (event: ReactPointerEvent<HTMLDivElement>, shiftId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const currentShift = effectiveShifts.find((shift) => shift.id === shiftId);
    if (!currentShift) return;
    const dayIndex = Math.max(0, columns.findIndex((column) => column.date === currentShift.start.slice(0, 10)));
    const startMinutes = minutesFromISO(currentShift.start);
    const endMinutes = minutesFromISO(currentShift.end);
    setDragState({
      type: 'move',
      shiftId,
      pointerId: event.pointerId,
      startX: event.clientX,
      originalDayIndex: dayIndex,
      originalStartMinutes: startMinutes,
      originalEndMinutes: endMinutes,
      originalTotalStart: dayIndex * MINUTES_PER_DAY + startMinutes,
      originalTotalEnd: dayIndex * MINUTES_PER_DAY + endMinutes,
      originalShift: currentShift,
    });
    setPendingShift({ ...currentShift });
    setDragPreview(currentShift);
    onSelectShift(shiftId);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    payload: { shiftId: string; direction: 'left' | 'right' },
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const currentShift = effectiveShifts.find((shift) => shift.id === payload.shiftId);
    if (!currentShift) return;
    const dayIndex = Math.max(0, columns.findIndex((column) => column.date === currentShift.start.slice(0, 10)));
    const startMinutes = minutesFromISO(currentShift.start);
    const endMinutes = minutesFromISO(currentShift.end);
    setDragState({
      type: 'resize',
      direction: payload.direction,
      shiftId: payload.shiftId,
      pointerId: event.pointerId,
      startX: event.clientX,
      originalDayIndex: dayIndex,
      originalStartMinutes: startMinutes,
      originalEndMinutes: endMinutes,
      originalTotalStart: dayIndex * MINUTES_PER_DAY + startMinutes,
      originalTotalEnd: dayIndex * MINUTES_PER_DAY + endMinutes,
      originalShift: currentShift,
    });
    setPendingShift({ ...currentShift });
    setDragPreview(currentShift);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
          <span>{view.toUpperCase()} VIEW</span>
          <span className="text-muted/60">•</span>
          <span>
            {rows.length} {grouping === 'employee' ? 'team members' : 'roles'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('rounded-full px-2 py-1', canUndo ? 'bg-surface/80' : 'opacity-60')}>Ctrl/Cmd + Z</span>
          <span className={cn('rounded-full px-2 py-1', canRedo ? 'bg-surface/80' : 'opacity-60')}>Ctrl/Cmd + Y</span>
          <Button variant="ghost" size="sm" disabled={!canUndo} onClick={undo}>
            Undo
          </Button>
          <Button variant="ghost" size="sm" disabled={!canRedo} onClick={redo}>
            Redo
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur">
        <div className="grid border-b border-border" style={{ gridTemplateColumns }}>
          <div className="flex h-16 items-center justify-between gap-2 border-r border-border px-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{grouping === 'employee' ? 'Employee' : 'Role'}</p>
              <p className="text-xs text-muted-foreground">Double-click a cell to add a shift · drag to move or resize</p>
            </div>
          </div>
          {columns.map((column) => {
            const heat = coverageHeatmap[column.key];
            const deficit = heat
              ? heat.required.reduce((max, value, index) => Math.max(max, value - (heat.scheduled[index] ?? 0)), 0)
              : 0;
            return (
              <div key={column.key} className="flex h-16 flex-col justify-center border-r border-border bg-gradient-to-b from-background/30 to-background/10 px-4">
                <p className="text-sm font-semibold text-foreground">{column.label}</p>
                <p className={cn('text-xs', deficit > 0 ? 'text-amber-500' : 'text-muted-foreground')}>
                  {deficit > 0 ? `${deficit} coverage gap` : 'Fully staffed'}
                </p>
              </div>
            );
          })}
        </div>
        <div ref={containerRef} className="relative h-full overflow-auto" onScroll={handleScroll}>
          <div
            className="relative"
            style={{
              width: ROW_HEADER_WIDTH + columns.length * columnWidth,
              height: totalHeight,
            }}
          >
            <div
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${translateY}px)` }}
            >
              {visibleRows.map((row) => {
                const rowShifts = shiftsByRow.get(row.id) ?? [];
                return (
                  <div
                    key={row.id}
                    className="grid border-b border-border/70"
                    style={{ gridTemplateColumns, height: rowHeight }}
                  >
                    <div className="sticky left-0 flex h-full flex-col justify-between gap-2 border-r border-border bg-surface/95 px-4 py-3 backdrop-blur">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{row.label}</p>
                        {row.subLabel && <p className="text-xs text-muted-foreground">{row.subLabel}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {templates.slice(0, 2).map((template) => (
                          <Button
                            key={template.id}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => applyTemplate(template.id, { rowId: row.id, date: columns[0]?.date ?? '' })}
                          >
                            {template.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {columns.map((column) => {
                      const cellShifts = rowShifts.filter((shift) => shift.start.slice(0, 10) === column.key);
                      const heat = coverageHeatmap[column.key];
                      return (
                        <div
                          key={`${row.id}-${column.key}`}
                          className="relative border-r border-border/60"
                          onDoubleClick={(event) => handleCellDoubleClick(row.id, column.key, event)}
                        >
                          <CoverageOverlay heat={heat} />
                          {cellShifts.map((shift) => {
                            const startMinutes = minutesFromISO(shift.start);
                            const endMinutes = minutesFromISO(shift.end);
                            const left = (startMinutes / MINUTES_PER_DAY) * columnWidth;
                            const width = Math.max(8, ((endMinutes - startMinutes) / MINUTES_PER_DAY) * columnWidth);
                            const isSelected = selectedShiftId === shift.id;
                            return (
                              <ShiftCard
                                key={shift.id}
                                shift={shift}
                                style={{ left, width, position: 'absolute', top: 8, bottom: 8 }}
                                isSelected={isSelected}
                                isGhost={dragPreview?.id === shift.id}
                                onSelect={onSelectShift}
                                onOpenEditor={onBeginEditShift}
                                onPointerDown={handleShiftPointerDown}
                                onResizeHandleDown={handleResizePointerDown}
                              />
                            );
                          })}
                          {preview && cellShifts.length === 0 && (
                            <div className="absolute inset-2 rounded-lg border-2 border-dashed border-amber-400/70 bg-amber-400/10" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
