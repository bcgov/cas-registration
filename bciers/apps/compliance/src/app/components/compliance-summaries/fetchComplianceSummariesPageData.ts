import { ComplianceSummary } from "./types";

export const fetchComplianceSummariesPageData = async (params: {
  [key: string]: any;
}): Promise<{
  rows: ComplianceSummary[];
  row_count: number;
}> => {
  // TODO: Replace with actual API call
  const mockData: ComplianceSummary[] = [
    {
      id: "1",
      reportingYear: 2023,
      operationName: "Operation A",
      excessEmissions: 1500,
      outstandingBalance: 1000,
      complianceStatus: "Obligation fully met",
      penaltyStatus: "No penalties",
      obligationId: "OBL-2023-001",
    },
    {
      id: "2",
      reportingYear: 2023,
      operationName: "Operation B",
      excessEmissions: 2500,
      outstandingBalance: 2000,
      complianceStatus: "Pending",
      penaltyStatus: "Late submission",
      obligationId: "OBL-2023-002",
    },
    {
      id: "3",
      reportingYear: 2022,
      operationName: "Operation C",
      excessEmissions: 500,
      outstandingBalance: 0,
      complianceStatus: "Obligation fully met",
      penaltyStatus: "No penalties",
      obligationId: "OBL-2022-003",
    },
  ];

  return {
    rows: mockData,
    row_count: mockData.length,
  };
}; 