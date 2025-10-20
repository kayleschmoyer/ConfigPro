import { useSyncExternalStore } from 'react';

import type { Org } from '../types/core';
import type { CurrentUser } from './auth';

export type AuthStatus = 'loading' | 'authenticated' | 'signed-out';

export interface SessionInfo {
  /** Identifier for correlating a backend session */
  id: string;
  /** Access token issued for the session */
  token: string;
  /** Optional refresh token for renewing access */
  refreshToken?: string;
  /** ISO timestamp when the token was issued */
  issuedAt?: string;
  /** ISO timestamp when the token will expire */
  expiresAt?: string;
}

export interface AuthState {
  user: CurrentUser | null;
  org: Org | null;
  session: SessionInfo | null;
  status: AuthStatus;
  /** Last timestamp (epoch ms) when auth state was refreshed from the server */
  lastSyncedAt: number | null;
}

const DEFAULT_STATE: AuthState = {
  user: null,
  org: null,
  session: null,
  status: 'loading',
  lastSyncedAt: null,
};

let state: AuthState = { ...DEFAULT_STATE };

const listeners = new Set<(state: AuthState) => void>();

const isSameState = (a: AuthState, b: AuthState) =>
  a.user === b.user &&
  a.org === b.org &&
  a.session === b.session &&
  a.status === b.status &&
  a.lastSyncedAt === b.lastSyncedAt;

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

const setState = (updater: (previous: AuthState) => AuthState) => {
  const previous = state;
  const next = updater(previous);
  if (next === previous || isSameState(previous, next)) return;
  state = next;
  notify();
};

export const authStore = {
  getState: () => state,
  subscribe: (listener: (state: AuthState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hydrate: (payload: Partial<AuthState>) =>
    setState((previous) => {
      const next: AuthState = { ...previous, ...payload };
      return isSameState(previous, next) ? previous : next;
    }),
  setUser: (user: CurrentUser | null) =>
    setState((previous) => {
      const nextStatus: AuthStatus = user
        ? 'authenticated'
        : previous.session
          ? 'authenticated'
          : 'signed-out';
      const next: AuthState = { ...previous, user, status: nextStatus };
      return isSameState(previous, next) ? previous : next;
    }),
  setOrg: (org: Org | null) =>
    setState((previous) => {
      const next: AuthState = { ...previous, org };
      return isSameState(previous, next) ? previous : next;
    }),
  setSession: (session: SessionInfo | null) =>
    setState((previous) => {
      const nextStatus: AuthStatus = session
        ? 'authenticated'
        : previous.user
          ? 'authenticated'
          : 'signed-out';
      const next: AuthState = { ...previous, session, status: nextStatus };
      return isSameState(previous, next) ? previous : next;
    }),
  markSynced: (timestamp = Date.now()) =>
    setState((previous) => {
      const next: AuthState = { ...previous, lastSyncedAt: timestamp };
      return isSameState(previous, next) ? previous : next;
    }),
  signOut: () =>
    setState(() => ({
      ...DEFAULT_STATE,
      status: 'signed-out',
    })),
};

export const useAuthStore = <T>(selector: (state: AuthState) => T): T =>
  useSyncExternalStore(
    authStore.subscribe,
    () => selector(authStore.getState()),
    () => selector(DEFAULT_STATE),
  );

export const getAuthSnapshot = () => authStore.getState();
export const DEFAULT_AUTH_STATE: AuthState = { ...DEFAULT_STATE };
