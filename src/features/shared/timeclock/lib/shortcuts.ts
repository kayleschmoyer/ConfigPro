import { useEffect } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;

export const useShortcut = (sequence: string, handler: ShortcutHandler) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const keys = sequence.toLowerCase().split(' ');
    let buffer: string[] = [];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const key = event.key.toLowerCase();
      buffer = [...buffer, key].slice(-keys.length);
      if (keys.every((value, index) => buffer[index] === value)) {
        handler(event);
        buffer = [];
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler, sequence]);
};
