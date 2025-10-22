import { useCallback, useState } from 'react';
import type { Shift } from '../lib';

type PublishSnapshot = {
  id: string;
  createdAt: string;
  label: string;
  shifts: Shift[];
};

export const usePublishing = (initialShifts: Shift[]) => {
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [snapshots, setSnapshots] = useState<PublishSnapshot[]>([]);

  const publish = useCallback((shifts: Shift[]) => {
    const snapshot: PublishSnapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label: `Release ${snapshots.length + 1}`,
      shifts,
    };
    setSnapshots((current) => [snapshot, ...current]);
    setStatus('PUBLISHED');
  }, [snapshots.length]);

  const revertToDraft = useCallback(() => {
    setStatus('DRAFT');
  }, []);

  return {
    status,
    snapshots,
    publish,
    revertToDraft,
    latestSnapshot: snapshots[0] ?? null,
    initialShifts,
  };
};
