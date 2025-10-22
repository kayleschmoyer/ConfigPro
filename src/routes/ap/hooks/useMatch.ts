import { useMemo } from 'react';
import { assessThreeWayMatch } from '../lib/match';
import type { Bill, PO, Receiving } from '../lib/types';

export const useMatch = (bill?: Bill, po?: PO, receiving?: Receiving) => {
  const assessment = useMemo(() => {
    if (!bill) return undefined;
    return assessThreeWayMatch(bill, po, receiving);
  }, [bill, po, receiving]);

  return { assessment };
};
