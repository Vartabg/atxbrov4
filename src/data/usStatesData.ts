export interface StateData {
  code: string;
  name: string;
  position: [number, number, number]; // 3D position for map placement
  veteranPopulation: number;
  activeBenefitsPrograms: number;
  majorVAFacilities: string[];
  specialPrograms: string[];
  benefitsStats: {
    disability: number;
    education: number;
    healthcare: number;
    homeLoan: number;
  };
  emergencyContacts: {
    vaHotline: string;
    localCrisisLine?: string;
  };
  color: string; // Visual representation color
}

export const US_STATES_DATA: StateData[] = [
  {
    code: 'CA',
    name: 'California',
    position: [-120.0, 36.8, 0],
    veteranPopulation: 1634000,
    activeBenefitsPrograms: 45,
    majorVAFacilities: ['Los Angeles VAMC', 'San Diego VAMC', 'San Francisco VAMC', 'Palo Alto VAMC'],
    specialPrograms: ['PTSD Treatment Centers', 'Women Veterans Program', 'Homeless Veterans Initiative'],
    benefitsStats: {
      disability: 487000,
      education: 234000,
      healthcare: 890000,
      homeLoan: 156000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#1e40af'
  },
  {
    code: 'TX',
    name: 'Texas',
    position: [-99.0, 31.0, 0],
    veteranPopulation: 1540000,
    activeBenefitsPrograms: 42,
    majorVAFacilities: ['Houston VAMC', 'Dallas VAMC', 'San Antonio VAMC', 'Temple VAMC'],
    specialPrograms: ['Rural Veterans Health', 'Military Sexual Trauma Support', 'Vocational Rehabilitation'],
    benefitsStats: {
      disability: 456000,
      education: 298000,
      healthcare: 823000,
      homeLoan: 189000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#dc2626'
  },
  {
    code: 'FL',
    name: 'Florida',
    position: [-82.0, 28.0, 0],
    veteranPopulation: 1500000,
    activeBenefitsPrograms: 38,
    majorVAFacilities: ['Miami VAMC', 'Tampa VAMC', 'Gainesville VAMC', 'West Palm Beach VAMC'],
    specialPrograms: ['Aging Veterans Care', 'Spinal Cord Injury Center', 'Blind Rehabilitation'],
    benefitsStats: {
      disability: 445000,
      education: 187000,
      healthcare: 798000,
      homeLoan: 167000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#f59e0b'
  },
  {
    code: 'NY',
    name: 'New York',
    position: [-75.0, 43.0, 0],
    veteranPopulation: 890000,
    activeBenefitsPrograms: 41,
    majorVAFacilities: ['Bronx VAMC', 'Brooklyn VAMC', 'Manhattan VAMC', 'Buffalo VAMC'],
    specialPrograms: ['Urban Veterans Initiative', 'Financial Counseling', 'Legal Services'],
    benefitsStats: {
      disability: 267000,
      education: 145000,
      healthcare: 534000,
      homeLoan: 89000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#7c3aed'
  },
  {
    code: 'PA',
    name: 'Pennsylvania',
    position: [-77.5, 40.8, 0],
    veteranPopulation: 800000,
    activeBenefitsPrograms: 36,
    majorVAFacilities: ['Philadelphia VAMC', 'Pittsburgh VAMC', 'Lebanon VAMC'],
    specialPrograms: ['Rural Outreach', 'Mental Health Integration', 'Caregiver Support'],
    benefitsStats: {
      disability: 234000,
      education: 123000,
      healthcare: 445000,
      homeLoan: 67000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#059669'
  },
  {
    code: 'VA',
    name: 'Virginia',
    position: [-78.0, 37.5, 0],
    veteranPopulation: 790000,
    activeBenefitsPrograms: 44,
    majorVAFacilities: ['Richmond VAMC', 'Hampton VAMC', 'Salem VAMC'],
    specialPrograms: ['Active Military Transition', 'Federal Employee Benefits', 'Military Family Support'],
    benefitsStats: {
      disability: 245000,
      education: 156000,
      healthcare: 467000,
      homeLoan: 123000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1',
      localCrisisLine: '1-800-273-8255'
    },
    color: '#ea580c'
  },
  // Adding key additional states for comprehensive coverage
  {
    code: 'IL',
    name: 'Illinois',
    position: [-89.0, 40.0, 0],
    veteranPopulation: 650000,
    activeBenefitsPrograms: 34,
    majorVAFacilities: ['Hines VAMC', 'Jesse Brown VAMC', 'North Chicago VAMC'],
    specialPrograms: ['Urban Healthcare', 'Research Programs', 'Prosthetics Center'],
    benefitsStats: {
      disability: 198000,
      education: 134000,
      healthcare: 387000,
      homeLoan: 78000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1'
    },
    color: '#0891b2'
  },
  {
    code: 'OH',
    name: 'Ohio',
    position: [-82.5, 40.2, 0],
    veteranPopulation: 720000,
    activeBenefitsPrograms: 32,
    majorVAFacilities: ['Cleveland VAMC', 'Cincinnati VAMC', 'Dayton VAMC'],
    specialPrograms: ['Manufacturing Job Training', 'Rural Health', 'Substance Abuse Treatment'],
    benefitsStats: {
      disability: 234000,
      education: 98000,
      healthcare: 456000,
      homeLoan: 89000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1'
    },
    color: '#be185d'
  },
  {
    code: 'NC',
    name: 'North Carolina',
    position: [-79.0, 35.5, 0],
    veteranPopulation: 750000,
    activeBenefitsPrograms: 37,
    majorVAFacilities: ['Durham VAMC', 'Fayetteville VAMC', 'Asheville VAMC'],
    specialPrograms: ['Military Base Integration', 'Agent Orange Support', 'TBI Treatment'],
    benefitsStats: {
      disability: 256000,
      education: 167000,
      healthcare: 445000,
      homeLoan: 134000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1'
    },
    color: '#7c2d12'
  },
  {
    code: 'WA',
    name: 'Washington',
    position: [-120.5, 47.5, 0],
    veteranPopulation: 560000,
    activeBenefitsPrograms: 39,
    majorVAFacilities: ['Seattle VAMC', 'Spokane VAMC', 'American Lake VAMC'],
    specialPrograms: ['Tech Industry Transition', 'Environmental Health', 'Suicide Prevention'],
    benefitsStats: {
      disability: 187000,
      education: 123000,
      healthcare: 334000,
      homeLoan: 89000
    },
    emergencyContacts: {
      vaHotline: '988 Press 1'
    },
    color: '#166534'
  },
  // Representative sample covering major regions and populations
  // Additional states can be added following this pattern
];

export const BENEFITS_CATEGORIES = {
  disability: {
    name: 'Disability Benefits',
    description: 'Compensation for service-connected disabilities',
    icon: '🏥',
    color: '#dc2626'
  },
  education: {
    name: 'Education Benefits',
    description: 'GI Bill and education assistance programs',
    icon: '🎓',
    color: '#059669'
  },
  healthcare: {
    name: 'Healthcare',
    description: 'VA medical care and mental health services',
    icon: '⚕️',
    color: '#2563eb'
  },
  homeLoan: {
    name: 'Home Loans',
    description: 'VA-backed home loans and housing assistance',
    icon: '🏠',
    color: '#7c3aed'
  }
};

// Utility functions for data processing
export const getStateByCode = (code: string): StateData | undefined => {
  return US_STATES_DATA.find(state => state.code === code);
};

export const getStatesByRegion = (centerLat: number, centerLon: number, radius: number): StateData[] => {
  return US_STATES_DATA.filter(state => {
    const [lon, lat] = state.position;
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2));
    return distance <= radius;
  });
};

export const getTotalVeteranPopulation = (): number => {
  return US_STATES_DATA.reduce((total, state) => total + state.veteranPopulation, 0);
};

export const getTopStatesByVeteranCount = (limit: number = 5): StateData[] => {
  return [...US_STATES_DATA]
    .sort((a, b) => b.veteranPopulation - a.veteranPopulation)
    .slice(0, limit);
};