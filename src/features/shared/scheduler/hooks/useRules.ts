import { useCallback, useState } from 'react';
import { sampleLabor } from '../lib/constants';
import type { LaborLawProfile } from '../lib';

export const useRules = () => {
  const [profile, setProfile] = useState<LaborLawProfile>(sampleLabor);

  const updateProfile = useCallback((next: Partial<LaborLawProfile>) => {
    setProfile((current) => ({ ...current, ...next }));
  }, []);

  return {
    profile,
    updateProfile,
  };
};
