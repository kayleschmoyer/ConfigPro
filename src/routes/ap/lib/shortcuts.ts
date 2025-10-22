import { useEffect } from 'react';

export type ShortcutMap = Record<string, () => void>;

const sequenceMatches = (sequence: string[], buffer: string[]) =>
  sequence.every((key, index) => buffer[buffer.length - sequence.length + index] === key);

export const useShortcutSequence = (map: ShortcutMap) => {
  useEffect(() => {
    const buffer: string[] = [];

    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      buffer.push(event.key.toLowerCase());
      if (buffer.length > 3) buffer.shift();

      Object.entries(map).forEach(([combo, action]) => {
        const parts = combo.split(' ').map((part) => part.toLowerCase());
        if (parts.length > buffer.length) return;
        if (sequenceMatches(parts, buffer)) {
          event.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map]);
};
