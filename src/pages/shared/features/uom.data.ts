export type UnitOfMeasure = {
  id: string;
  family: string;
  baseUnit: string;
  description: string;
  units: {
    id: string;
    name: string;
    symbol: string;
    description: string;
  }[];
};

export type UnitConversion = {
  id: string;
  from: string;
  to: string;
  formula: string;
  notes: string;
};

export const unitsOfMeasure: UnitOfMeasure[] = [
  {
    id: 'quantity',
    family: 'Quantity',
    baseUnit: 'Each',
    description: 'Standard count used for discrete goods, software seats, and entitlement bundles.',
    units: [
      {
        id: 'each',
        name: 'Each',
        symbol: 'EA',
        description: 'Single discrete item such as a device, component, or SKU.',
      },
      {
        id: 'pack',
        name: 'Pack',
        symbol: 'PK',
        description: 'Grouped quantity with a fixed count used for retail, wholesale, or replenishment.',
      },
      {
        id: 'case',
        name: 'Case',
        symbol: 'CS',
        description: 'Bulk grouping aligned to logistics or supplier packaging.',
      },
    ],
  },
  {
    id: 'time',
    family: 'Time',
    baseUnit: 'Hour',
    description: 'Elapsed service delivery or labour time for billable services and support.',
    units: [
      {
        id: 'minute',
        name: 'Minute',
        symbol: 'MIN',
        description: 'Used for high-resolution service tracking, SLAs, or consumption billing.',
      },
      {
        id: 'hour',
        name: 'Hour',
        symbol: 'HR',
        description: 'Primary base unit for services, labour planning, and rate cards.',
      },
      {
        id: 'day',
        name: 'Day',
        symbol: 'DAY',
        description: 'Aggregated time unit for onsite engagements or managed services retainers.',
      },
    ],
  },
  {
    id: 'weight',
    family: 'Weight',
    baseUnit: 'Kilogram',
    description: 'Physical mass measurements critical for freight, shipping, and compliance.',
    units: [
      {
        id: 'gram',
        name: 'Gram',
        symbol: 'G',
        description: 'Fine-grain unit for lab, pharmaceutical, or precision manufacturing use cases.',
      },
      {
        id: 'kilogram',
        name: 'Kilogram',
        symbol: 'KG',
        description: 'International standard for trade, logistics, and regulatory reporting.',
      },
      {
        id: 'pound',
        name: 'Pound',
        symbol: 'LB',
        description: 'Imperial unit for North American commerce and shipping integrations.',
      },
    ],
  },
  {
    id: 'volume',
    family: 'Volume',
    baseUnit: 'Litre',
    description: 'Fluid handling across food, chemical, and industrial supply chains.',
    units: [
      {
        id: 'millilitre',
        name: 'Millilitre',
        symbol: 'ML',
        description: 'Precision dosing for healthcare, cosmetics, and laboratory catalogues.',
      },
      {
        id: 'litre',
        name: 'Litre',
        symbol: 'L',
        description: 'Base unit for blended products, refills, and industrial fluids.',
      },
      {
        id: 'gallon',
        name: 'Gallon',
        symbol: 'GAL',
        description: 'Common US customary unit for distribution and logistics.',
      },
    ],
  },
  {
    id: 'length',
    family: 'Length',
    baseUnit: 'Metre',
    description: 'Dimensional tracking for fabrication, textiles, and infrastructure projects.',
    units: [
      {
        id: 'millimetre',
        name: 'Millimetre',
        symbol: 'MM',
        description: 'High-precision measurements for machining and component tolerances.',
      },
      {
        id: 'metre',
        name: 'Metre',
        symbol: 'M',
        description: 'Global base unit for engineering, construction, and survey data.',
      },
      {
        id: 'foot',
        name: 'Foot',
        symbol: 'FT',
        description: 'Imperial unit supporting architectural and facilities catalogues.',
      },
    ],
  },
  {
    id: 'area',
    family: 'Area',
    baseUnit: 'Square metre',
    description: 'Surface coverage for facilities, landscaping, and installation services.',
    units: [
      {
        id: 'square-foot',
        name: 'Square foot',
        symbol: 'SQFT',
        description: 'Used in North American commercial real estate and facilities contracts.',
      },
      {
        id: 'square-metre',
        name: 'Square metre',
        symbol: 'SQM',
        description: 'Metric standard for global property and installation services.',
      },
      {
        id: 'acre',
        name: 'Acre',
        symbol: 'AC',
        description: 'Large-scale outdoor projects such as agriculture, solar, or utilities.',
      },
    ],
  },
];

export const unitConversions: UnitConversion[] = [
  {
    id: 'minutes-to-hours',
    from: 'Minutes',
    to: 'Hours',
    formula: 'hours = minutes / 60',
    notes: 'Used in service billing and workforce analytics when aggregating labour submissions.',
  },
  {
    id: 'hours-to-days',
    from: 'Hours',
    to: 'Days',
    formula: 'days = hours / 8',
    notes: 'Applies configurable workday definitions for project accounting and capacity planning.',
  },
  {
    id: 'grams-to-kilograms',
    from: 'Grams',
    to: 'Kilograms',
    formula: 'kilograms = grams / 1000',
    notes: 'Supports manufacturing and compliance exports requiring SI units.',
  },
  {
    id: 'pounds-to-kilograms',
    from: 'Pounds',
    to: 'Kilograms',
    formula: 'kilograms = pounds × 0.453592',
    notes: 'Ensures parity between US logistics partners and global cost models.',
  },
  {
    id: 'gallons-to-litres',
    from: 'Gallons',
    to: 'Litres',
    formula: 'litres = gallons × 3.78541',
    notes: 'Normalises US customary units with global supply chain reporting.',
  },
  {
    id: 'square-feet-to-square-metres',
    from: 'Square feet',
    to: 'Square metres',
    formula: 'square metres = square feet × 0.092903',
    notes: 'Aligns facilities planning metrics with internationally recognised standards.',
  },
];

