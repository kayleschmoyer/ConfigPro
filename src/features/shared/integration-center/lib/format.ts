export function formatRelative(value?: string) {
  if (!value) return '—';
  const distance = Date.now() - new Date(value).getTime();
  const abs = Math.abs(distance);
  const minutes = Math.round(abs / 60000);
  if (minutes < 1) return distance <= 0 ? 'in moments' : 'just now';
  if (minutes < 60) return distance <= 0 ? `in ${minutes}m` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return distance <= 0 ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return distance <= 0 ? `in ${days}d` : `${days}d ago`;
}

export function formatTimestamp(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

export const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

export const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
