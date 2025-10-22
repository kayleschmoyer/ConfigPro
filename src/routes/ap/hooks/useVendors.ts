import { useMemo, useState } from 'react';
import { rankVendorRisk } from '../lib/risk';
import type { Vendor } from '../lib/types';

const vendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'ACME Supplies',
    terms: '2/10 net 30',
    defaultCurrency: 'USD',
    paymentMethods: ['ACH', 'CARD'],
    bankVerified: true,
    riskScore: 32,
    tags: ['Strategic', 'Office'],
    contacts: [{ name: 'Priya Patel', email: 'ap@acme.com', phone: '+1-415-555-0192' }],
    docs: [{ kind: 'W9', url: '#', expiresAt: new Date().toISOString() }],
  },
  {
    id: 'vendor-2',
    name: 'Northwind Logistics',
    terms: 'Net 45',
    defaultCurrency: 'USD',
    paymentMethods: ['ACH', 'WIRE'],
    bankVerified: false,
    riskScore: 68,
    tags: ['Critical'],
    contacts: [{ name: 'Jordan Lee', email: 'finance@northwind.com' }],
    docs: [{ kind: 'INSURANCE', url: '#', expiresAt: new Date(Date.now() + 86_400_000 * 45).toISOString() }],
  },
  {
    id: 'vendor-3',
    name: 'Lumen Power',
    terms: 'Net 15',
    defaultCurrency: 'USD',
    paymentMethods: ['ACH'],
    bankVerified: true,
    riskScore: 81,
    tags: ['Utilities'],
    contacts: [{ name: 'Billing Desk', email: 'billing@lumenpower.com' }],
    docs: [{ kind: 'CONTRACT', url: '#', expiresAt: new Date(Date.now() + 86_400_000 * 120).toISOString() }],
  },
];

export const useVendors = () => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    if (!lowered) return vendors;
    return vendors.filter((vendor) => vendor.name.toLowerCase().includes(lowered));
  }, [search]);

  const decorated = useMemo(
    () =>
      filtered.map((vendor) => ({
        vendor,
        risk: rankVendorRisk(vendor),
      })),
    [filtered]
  );

  return { vendors, filtered: decorated, search, setSearch };
};
