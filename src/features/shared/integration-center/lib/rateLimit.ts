export function rateLimitDescription(limit?: { perMin?: number; burst?: number }) {
  if (!limit?.perMin) {
    return 'Unlimited';
  }

  const burst = limit.burst ? ` • burst ${limit.burst}` : '';
  return `${limit.perMin}/min${burst}`;
}
