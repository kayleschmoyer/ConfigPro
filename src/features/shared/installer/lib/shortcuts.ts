import { useEffect } from 'react';

interface ShortcutHandlers {
  focusSearch?: () => void;
  goToStep?: (index: number) => void;
  apply?: () => void;
}

export const useInstallerShortcuts = ({ focusSearch, goToStep, apply }: ShortcutHandlers) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const isModifier = event.metaKey || event.ctrlKey;

      if (event.key === '/' && focusSearch) {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (event.key.toLowerCase() === 'g' && event.altKey && goToStep) {
        const numeric = Number(event.code.replace('Digit', ''));
        if (!Number.isNaN(numeric)) {
          event.preventDefault();
          goToStep(Math.max(0, numeric - 1));
        }
        return;
      }

      if (isModifier && event.key === 'Enter' && apply) {
        event.preventDefault();
        apply();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [apply, focusSearch, goToStep]);
};
