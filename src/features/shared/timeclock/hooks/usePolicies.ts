import { useCallback, useMemo, useState } from 'react';
import type { Policy } from '../lib';

const demoPolicies: Policy[] = [
  {
    id: 'us-flsa',
    name: 'US FLSA - Weekly 40 OT',
    overtime: { weeklyOTAfterMin: 40 * 60 },
    rounding: { mode: 'NEAREST', incrementMin: 6 },
    grace: { inMin: 5, outMin: 7 },
    breaks: { mealRequired: true, mealMin: 30, paidBreakMin: 10 },
    geofence: { center: { lat: 37.7749, lng: -122.4194 }, radiusMeters: 200 },
    antiBuddy: { selfieRequired: false, livenessRandom: false },
    permissions: { employeeEditOwn: true, managerEditTeam: true },
  },
  {
    id: 'ca-daily',
    name: 'California Daily OT/DT',
    overtime: { dailyOTAfterMin: 8 * 60, dailyDTAfterMin: 12 * 60 },
    rounding: { mode: 'NEAREST', incrementMin: 5 },
    grace: { inMin: 7, outMin: 7, breakMin: 5 },
    breaks: { mealRequired: true, mealMin: 30, secondMealAfterMin: 10 * 60 },
    geofence: {
      center: { lat: 34.0522, lng: -118.2437 },
      radiusMeters: 150,
      allowedSSIDs: ['ConfigPro-LA'],
    },
    antiBuddy: { selfieRequired: true, livenessRandom: true, rotatingQR: true },
    permissions: { employeeEditOwn: false, managerEditTeam: true },
  },
];

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>(demoPolicies);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(demoPolicies[0].id);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return policies;
    return policies.filter((policy) => policy.name.toLowerCase().includes(search.toLowerCase()));
  }, [policies, search]);

  const updatePolicy = useCallback((policyId: string, updates: Partial<Policy>) => {
    setPolicies((prev) => prev.map((policy) => (policy.id === policyId ? { ...policy, ...updates } : policy)));
  }, []);

  const createPolicy = useCallback((policy: Policy) => {
    setPolicies((prev) => [...prev, policy]);
  }, []);

  return {
    policies,
    filtered,
    selectedPolicyId,
    setSelectedPolicyId,
    search,
    setSearch,
    updatePolicy,
    createPolicy,
  };
};
