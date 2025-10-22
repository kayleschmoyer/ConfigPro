import { useEffect } from 'react';

export type ShortcutMap = {
  focusSearch: () => void;
  goSchedule: () => void;
  newShift: () => void;
  moveSelection: (direction: 'left' | 'right') => void;
  resizeSelection: (direction: 'left' | 'right') => void;
  undo: () => void;
  redo: () => void;
};

export const useSchedulerShortcuts = (actions: ShortcutMap) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const key = event.key.toLowerCase();
      if (key === '/' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        actions.focusSearch();
        return;
      }
      if (event.key === 'G' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
        let nextKey = '';
        const listener = (next: KeyboardEvent) => {
          nextKey = next.key.toLowerCase();
          if (nextKey === 's') {
            next.preventDefault();
            actions.goSchedule();
          }
          window.removeEventListener('keydown', listener, true);
        };
        window.addEventListener('keydown', listener, true);
        return;
      }
      if (key === 'n') {
        event.preventDefault();
        actions.newShift();
        return;
      }
      if (key === 'arrowleft') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.resizeSelection('left');
        } else {
          actions.moveSelection('left');
        }
        return;
      }
      if (key === 'arrowright') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.resizeSelection('right');
        } else {
          actions.moveSelection('right');
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        actions.undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && (key === 'y' || (event.shiftKey && key === 'z'))) {
        event.preventDefault();
        actions.redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
};
