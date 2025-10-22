import { useEffect } from 'react';

type ShortcutHandler = () => void;

type ShortcutMap = Record<string, ShortcutHandler>;

const normalize = (value: string) => value.toLowerCase().trim();

export const useInventoryShortcuts = (handlers: ShortcutMap) => {
  useEffect(() => {
    let buffer: string[] = [];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = normalize(event.key);
      if (key === 'escape') {
        buffer = [];
        return;
      }

      if (key === 'g') {
        buffer = ['g'];
        return;
      }

      if (buffer[0] === 'g') {
        const sequence = `g ${key}`;
        const handler = handlers[sequence];
        if (handler) {
          event.preventDefault();
          handler();
          buffer = [];
        } else {
          buffer = [];
        }
        return;
      }

      const handler = handlers[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
};
