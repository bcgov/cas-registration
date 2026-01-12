export const naicsCodesMock = [
  {
    id: 1,
    naics_code: "211110",
    naics_description: "Oil and gas extraction (except oil sands)",
  },
  {
    id: 2,
    naics_code: "212114",
    naics_description: "Bituminous coal mining",
  },
];

export const reportingActivitiesMock = [
  {
    id: 1,
    name: "General stationary combustion excluding line tracing",
    applicable_to: "all",
  },
  {
    id: 2,
    name: "Fuel combustion by mobile equipment",
    applicable_to: "Single Facility Operation",
  },
];

export const businessStructuresMock = [
  { name: "General Partnership" },
  { name: "BC Corporation" },
];

export const regulatedProductsMock = [
  { id: 1, name: "BC-specific refinery complexity throughput" },
  { id: 2, name: "Cement equivalent" },
];

export const contactsMock = {
  items: [
    {
      id: 1,
      first_name: "Ivy",
      last_name: "Jones",
      email: "ivy.jones@example.com",
    },
    {
      id: 2,
      first_name: "Jack",
      last_name: "King",
      email: "jack.king@example.com",
    },
  ],
  count: 2,
};

export const registrationPurposesMock = [
  "Potential Reporting Operation",
  "Reporting Operation",
  "Opted-in Operation",
];

export const reportingYearsMock = [
  { reporting_year: 2024 },
  { reporting_year: 2025 },
  { reporting_year: 2026 },
  { reporting_year: 2027 },
];
