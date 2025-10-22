import { rateLimitDescription } from '../lib/rateLimit';
import type { Connection } from '../lib';

interface RateLimitBadgeProps {
  connection: Connection;
}

export function RateLimitBadge({ connection }: RateLimitBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
      <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
      {rateLimitDescription(connection.rateLimit)}
    </span>
  );
}
