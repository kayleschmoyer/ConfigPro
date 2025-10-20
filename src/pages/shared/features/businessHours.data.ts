export interface DailyOperatingWindow {
  day: string;
  open: string;
  close: string;
  notes?: string;
}

export interface BusinessHourTemplate {
  id: string;
  label: string;
  description: string;
  timezone: string;
  windows: DailyOperatingWindow[];
  staffingGuidelines: string[];
}

export interface HolidayScheduleEntry {
  id: string;
  name: string;
  observed: string;
  operationsPlan: string;
  workforceGuidance: string;
}

export interface TimezoneCoverageEntry {
  id: string;
  region: string;
  timezone: string;
  coverageModel: string;
  notes?: string;
}

export const businessHourTemplates: BusinessHourTemplate[] = [
  {
    id: 'flagship-retail',
    label: 'Flagship retail store',
    description:
      'Large-format stores with experiential zones, service clinics, and community programming that require extended coverage.',
    timezone: 'Local market timezone',
    windows: [
      { day: 'Monday – Thursday', open: '09:00', close: '21:00', notes: 'Merchandising refresh from 21:00 – 23:00' },
      { day: 'Friday – Saturday', open: '09:00', close: '22:00', notes: 'Evening events supported by concierge teams' },
      { day: 'Sunday', open: '10:00', close: '19:00', notes: 'Community workshops scheduled during open hours' },
    ],
    staffingGuidelines: [
      'Schedule guest experience captains to overlap with peak traffic every afternoon.',
      'Minimum of two certified service technicians on-site during all open hours.',
      'On-call facilities support within 30 minutes for experiential installations.',
    ],
  },
  {
    id: 'micro-fulfillment',
    label: 'Micro-fulfillment site',
    description:
      'Back-of-house dark stores that process same-day delivery and click-and-collect orders with automation pods.',
    timezone: 'Local market timezone',
    windows: [
      { day: 'Daily operations', open: '06:00', close: '00:00', notes: 'Split into four 6-hour waves with crew overlap' },
      { day: 'Automation maintenance', open: '00:00', close: '02:00', notes: 'Robotics calibration and sanitation' },
    ],
    staffingGuidelines: [
      'Wave captains review handoff dashboards at the top of each shift change.',
      'Delivery partner staging requires dock marshals on duty from 08:00 – 22:00.',
      'Escalate fulfillment exceptions to the command center via the shared incident queue.',
    ],
  },
  {
    id: 'corporate-hub',
    label: 'Corporate hub & workplace',
    description:
      'Hybrid-ready campuses that host leadership, product teams, and enablement programs.',
    timezone: 'Headquarters timezone',
    windows: [
      { day: 'Weekdays', open: '07:00', close: '20:00', notes: 'Core collaboration hours 10:00 – 16:00' },
      { day: 'Weekend access', open: '09:00', close: '15:00', notes: 'Badge access only, facilities on standby' },
    ],
    staffingGuidelines: [
      'Hospitality concierge coverage begins one hour before core collaboration hours.',
      'Security command monitors access logs continuously with hourly compliance checks.',
      'IT genius bar runs appointment blocks Tuesday – Thursday for hybrid employee support.',
    ],
  },
];

export const holidayCalendar: HolidayScheduleEntry[] = [
  {
    id: 'new-year',
    name: 'New Year Operations Reset',
    observed: 'January 1',
    operationsPlan: 'Retail closes, fulfillment shifts to emergency-only, corporate hubs badge-only.',
    workforceGuidance: 'Minimum security and incident response teams on-call; payroll runs holiday pay differentials.',
  },
  {
    id: 'mid-year-inventory',
    name: 'Mid-year Inventory Count',
    observed: 'Last Sunday in June',
    operationsPlan: 'Retail closed to guests, fulfillment on reduced hours, inventory robotics in full audit mode.',
    workforceGuidance: 'Require certified inventory leads on each site; schedule relief meals and hydration breaks.',
  },
  {
    id: 'winter-festival',
    name: 'Winter Festival Surge',
    observed: 'November 15 – December 31',
    operationsPlan: 'Extended retail hours nightly, fulfillment adds overnight wave, corporate hubs open late for command support.',
    workforceGuidance: 'Approve overtime guardrails, activate volunteer surge program, spin up pop-up break rooms.',
  },
];

export const timezoneCoverage: TimezoneCoverageEntry[] = [
  {
    id: 'americas',
    region: 'Americas',
    timezone: 'PT · MT · CT · ET',
    coverageModel: 'Follow-the-sun network operations with regional command pods handing off every six hours.',
    notes: 'All flagship stores mirror local timezone; fulfillment sites align to delivery partner SLAs.',
  },
  {
    id: 'emea',
    region: 'EMEA',
    timezone: 'GMT · CET · GST',
    coverageModel: 'Regional service desks coordinate with HQ product squads via weekly operating cadences.',
    notes: 'Holiday calendar localized per market with compliance playbooks in Confluence.',
  },
  {
    id: 'apac',
    region: 'APAC',
    timezone: 'SGT · JST · AEST',
    coverageModel: 'Hybrid hubs with shared analytics rooms support weekend shift swaps and global launches.',
    notes: 'Command center retains bilingual operations leads during regional campaign pushes.',
  },
];
