import { useEffect } from 'react';

type Shortcut = {
  keys: string[];
  handler: () => void;
};

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const pressed = `${event.shiftKey ? 'shift+' : ''}${event.ctrlKey || event.metaKey ? 'mod+' : ''}${event.key}`
        .toLowerCase()
        .replace(' ', '');

      shortcuts.forEach(({ keys, handler }) => {
        if (keys.some((key) => key.toLowerCase() === pressed)) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [shortcuts]);
}
