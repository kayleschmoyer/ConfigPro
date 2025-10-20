import { useSyncExternalStore } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
}

export interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  toasts: Toast[];
}

const DEFAULT_STATE: UiState = {
  theme: 'system',
  sidebarOpen: false,
  toasts: [],
};

let state: UiState = { ...DEFAULT_STATE };

const listeners = new Set<(state: UiState) => void>();

const isSameState = (a: UiState, b: UiState) =>
  a.theme === b.theme && a.sidebarOpen === b.sidebarOpen && a.toasts === b.toasts;

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

const setState = (updater: (previous: UiState) => UiState) => {
  const previous = state;
  const next = updater(previous);
  if (next === previous || isSameState(previous, next)) return;
  state = next;
  notify();
};

let toastCounter = 0;
const generateToastId = () => `toast-${Date.now()}-${(toastCounter += 1)}`;

export const uiStore = {
  getState: () => state,
  subscribe: (listener: (state: UiState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setTheme: (theme: ThemeMode) =>
    setState((previous) => {
      if (previous.theme === theme) return previous;
      return { ...previous, theme } satisfies UiState;
    }),
  openSidebar: () =>
    setState((previous) => (previous.sidebarOpen ? previous : { ...previous, sidebarOpen: true })),
  closeSidebar: () =>
    setState((previous) => (previous.sidebarOpen ? { ...previous, sidebarOpen: false } : previous)),
  toggleSidebar: () =>
    setState((previous) => ({ ...previous, sidebarOpen: !previous.sidebarOpen })),
  pushToast: (options: ToastOptions) => {
    const toast: Toast = {
      id: generateToastId(),
      createdAt: Date.now(),
      variant: 'info',
      ...options,
    };
    setState((previous) => ({ ...previous, toasts: [...previous.toasts, toast] }));
    return toast.id;
  },
  dismissToast: (id: string) =>
    setState((previous) => {
      const nextToasts = previous.toasts.filter((toast) => toast.id !== id);
      if (nextToasts.length === previous.toasts.length) return previous;
      return { ...previous, toasts: nextToasts } satisfies UiState;
    }),
  clearToasts: () =>
    setState((previous) => (previous.toasts.length ? { ...previous, toasts: [] } : previous)),
  reset: () =>
    setState((previous) => (isSameState(previous, DEFAULT_STATE) ? previous : { ...DEFAULT_STATE })),
};

export const useUiStore = <T>(selector: (state: UiState) => T): T =>
  useSyncExternalStore(
    uiStore.subscribe,
    () => selector(uiStore.getState()),
    () => selector(DEFAULT_STATE),
  );

export const getUiSnapshot = () => uiStore.getState();
export const DEFAULT_UI_STATE: UiState = { ...DEFAULT_STATE };
