import { motion } from 'framer-motion';
import type { CSSProperties, PointerEvent } from 'react';
import { cn } from '../../../lib/cn';
import { formatRange } from '../lib/format';
import type { ShiftWithMeta } from '../hooks/useSchedule';

export type ShiftCardProps = {
  shift: ShiftWithMeta;
  style: CSSProperties;
  isSelected: boolean;
  isGhost?: boolean;
  onSelect: (shiftId: string) => void;
  onOpenEditor: (shiftId: string) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>, shiftId: string) => void;
  onResizeHandleDown: (
    event: PointerEvent<HTMLButtonElement>,
    payload: { shiftId: string; direction: 'left' | 'right' },
  ) => void;
};

const statusClasses: Record<string, string> = {
  OVERTIME: 'bg-red-500/90 text-white',
  'MINOR-LAW': 'bg-amber-500/90 text-black',
  UNQUALIFIED: 'bg-rose-500/90 text-white',
  CLASH: 'bg-fuchsia-500/90 text-white',
  FATIGUE: 'bg-orange-500/90 text-white',
  DOUBLE_SHIFT: 'bg-purple-500/90 text-white',
  INSUFFICIENT_REST: 'bg-amber-400/90 text-black',
};

export const ShiftCard = ({
  shift,
  style,
  isSelected,
  isGhost,
  onSelect,
  onOpenEditor,
  onPointerDown,
  onResizeHandleDown,
}: ShiftCardProps) => {
  const flags = shift.violations.map((violation) => violation.code);
  const accent = shift.role?.color ?? '#6366f1';

  return (
    <motion.div
      layout
      layoutId={shift.id}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onPointerDown={(event) => onPointerDown(event, shift.id)}
      onDoubleClick={() => onOpenEditor(shift.id)}
      onFocus={() => onSelect(shift.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenEditor(shift.id);
        }
      }}
      style={{
        ...style,
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 60%, ${accent}c0 100%)`,
      }}
      className={cn(
        'group relative flex h-full cursor-grab flex-col justify-between overflow-hidden rounded-xl border border-white/10 px-3 py-2 text-sm text-white shadow-lg shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isSelected && 'ring-2 ring-white/90 ring-offset-2 ring-offset-black/40',
        isGhost && 'opacity-50 backdrop-blur-sm',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight">{shift.role?.name ?? 'Unassigned role'}</p>
          <p className="text-xs text-white/80">{formatRange(shift.start, shift.end)}</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenEditor(shift.id)}
          className="hidden rounded-full bg-black/30 px-2 py-1 text-xs font-semibold text-white/90 transition group-hover:block"
        >
          Edit
        </button>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-white/80">{shift.employee?.displayName ?? 'Unassigned'}</p>
          <p className="text-[11px] uppercase tracking-wide text-white/60">{shift.location?.name}</p>
        </div>
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flags.slice(0, 3).map((flag) => (
              <span
                key={flag}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  statusClasses[flag] ?? 'bg-black/40 text-white',
                )}
              >
                {flag.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-y-2 left-0 flex w-2 flex-col justify-between">
        <button
          type="button"
          aria-label="Resize earlier"
          tabIndex={-1}
          className="pointer-events-auto h-4 w-full cursor-ew-resize opacity-0 transition group-hover:opacity-100"
          onPointerDown={(event) => onResizeHandleDown(event, { shiftId: shift.id, direction: 'left' })}
        />
        <button
          type="button"
          aria-label="Resize later"
          tabIndex={-1}
          className="pointer-events-auto h-4 w-full cursor-ew-resize opacity-0 transition group-hover:opacity-100"
          onPointerDown={(event) => onResizeHandleDown(event, { shiftId: shift.id, direction: 'right' })}
        />
      </div>
    </motion.div>
  );
};
