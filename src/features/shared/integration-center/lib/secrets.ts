import type { SecretMask } from './types';

export function maskSecret(secret: string): SecretMask {
  const prefix = secret.slice(0, 6);
  return { prefix, masked: `${prefix}••••••••••` };
}

export function rotateSecret(previous: SecretMask, newlyRevealed: string) {
  return {
    previous,
    next: maskSecret(newlyRevealed)
  };
}

export function confirmReveal(confirmation: string, expected: string) {
  return confirmation.trim().toLowerCase() === expected.trim().toLowerCase();
}
