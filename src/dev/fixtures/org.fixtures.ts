import { Location, Org, User } from '../../shared/types/core';

type OrgFixture = Org & { industry: string; supportEmail: string };

type LocationFixture = Location & { address: string; phone?: string };

type UserFixture = User & { title: string };

export const demoOrgs: OrgFixture[] = [
  {
    id: 'acme-industries',
    name: 'Acme Industries',
    currency: 'USD',
    timeZone: 'America/Chicago',
    industry: 'Smart Manufacturing',
    supportEmail: 'ops@acme-industries.example',
  },
  {
    id: 'lumen-coffee',
    name: 'Lumen Coffee Collective',
    currency: 'CAD',
    timeZone: 'America/Vancouver',
    industry: 'Hospitality & Retail',
    supportEmail: 'hello@lumen-coffee.example',
  },
];

export const demoLocations: LocationFixture[] = [
  {
    id: 'acme-hq',
    orgId: 'acme-industries',
    name: 'Chicago Innovation Center',
    tz: 'America/Chicago',
    address: '88 W Kinzie St, Chicago, IL 60654',
    phone: '+1-312-555-0182',
  },
  {
    id: 'acme-rdc',
    orgId: 'acme-industries',
    name: 'Reno Distribution Hub',
    tz: 'America/Los_Angeles',
    address: '6200 Mill St, Reno, NV 89502',
  },
  {
    id: 'lumen-gastown',
    orgId: 'lumen-coffee',
    name: 'Gastown Roastery',
    tz: 'America/Vancouver',
    address: '315 Water St, Vancouver, BC V6B 1B9',
    phone: '+1-604-555-0149',
  },
  {
    id: 'lumen-seawall',
    orgId: 'lumen-coffee',
    name: 'Seawall Kiosk',
    tz: 'America/Vancouver',
    address: '1055 Canada Pl, Vancouver, BC V6C 0C3',
  },
];

export const demoUsers: UserFixture[] = [
  {
    id: 'user-ava',
    orgId: 'acme-industries',
    name: 'Ava Patel',
    email: 'ava.patel@acme-industries.example',
    roles: ['owner', 'admin'],
    title: 'VP, Platform Operations',
  },
  {
    id: 'user-luke',
    orgId: 'acme-industries',
    name: 'Luke Chen',
    email: 'luke.chen@acme-industries.example',
    roles: ['manager'],
    title: 'Manufacturing Systems Lead',
  },
  {
    id: 'user-sloane',
    orgId: 'lumen-coffee',
    name: 'Sloane Martin',
    email: 'sloane.martin@lumen-coffee.example',
    roles: ['owner'],
    title: 'Founder & CEO',
  },
  {
    id: 'user-river',
    orgId: 'lumen-coffee',
    name: 'River Campos',
    email: 'river.campos@lumen-coffee.example',
    roles: ['manager', 'viewer'],
    title: 'Head of Cafe Operations',
  },
  {
    id: 'user-ema',
    orgId: 'lumen-coffee',
    name: 'Ema Rodríguez',
    email: 'ema.rodriguez@lumen-coffee.example',
    roles: ['clerk'],
    title: 'Barista Lead',
  },
];

export const getOrgFixture = (orgId: string): OrgFixture | undefined =>
  demoOrgs.find((org) => org.id === orgId);

export const listOrgLocations = (orgId: string): LocationFixture[] =>
  demoLocations.filter((location) => location.orgId === orgId);

export const listOrgUsers = (orgId: string): UserFixture[] =>
  demoUsers.filter((user) => user.orgId === orgId);

export const searchOrgUsers = (query: string): UserFixture[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return demoUsers;
  }

  return demoUsers.filter((user) =>
    [user.name, user.email, user.title].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
};

export type { LocationFixture, OrgFixture, UserFixture };
