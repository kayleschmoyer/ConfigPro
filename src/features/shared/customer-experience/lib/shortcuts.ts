import { useEffect } from 'react';

export type ShortcutMap = Record<string, () => void>;

const normalize = (combo: string) =>
  combo
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .join(' ');

const matchShortcut = (event: KeyboardEvent, combo: string) => {
  const normalized = normalize(combo);
  const parts = normalized.split(' ');
  const sequence = parts.at(-1);
  if (!sequence) return false;
  const keys = sequence.split('+');
  const key = keys.at(-1);
  if (!key) return false;
  const requiresMeta = keys.includes('cmd') || keys.includes('meta');
  const requiresShift = keys.includes('shift');
  const requiresAlt = keys.includes('alt');
  const requiresCtrl = keys.includes('ctrl');

  if (requiresMeta !== (event.metaKey || event.key === 'Meta')) return false;
  if (requiresCtrl !== event.ctrlKey) return false;
  if (requiresAlt !== event.altKey) return false;
  if (requiresShift !== event.shiftKey) return false;

  return event.key.toLowerCase() === key;
};

export const useShortcuts = (shortcuts: ShortcutMap, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      for (const [combo, callback] of Object.entries(shortcuts)) {
        if (matchShortcut(event, combo)) {
          event.preventDefault();
          callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
};
