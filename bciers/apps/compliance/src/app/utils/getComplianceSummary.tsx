import { actionHandler } from "@bciers/actions";

const COMPLIANCE_CHARGE_RATES: Record<number, number> = {
  2024: 80,
  2025: 95,
  2026: 110,
  2027: 125,
  2028: 140,
  2029: 155,
  2030: 170,
};

export interface ComplianceSummary {
  id: number;
  operation_name: string;
  reporting_year: number;
  emissions_attributable_for_compliance: number;
  emissions_limit: number;
  excess_emissions: number;
  obligation_id: string;
  compliance_charge_rate: number;
  equivalent_value: number;
  compliance_status: string;
}

const parseDecimal = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
};

export const getComplianceSummary = async (
  complianceReportVersionId: number,
): Promise<ComplianceSummary> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}`,
    "GET",
    "",
  );
  if (data?.error) {
    throw new Error(`Failed to fetch compliance summary: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format from compliance summary endpoint");
  }
  const chargeRate = COMPLIANCE_CHARGE_RATES[data.reporting_year] || 80.0;
  const pageData = {
    ...data,
    operation_name: data.operation_name,
    reporting_year: data.reporting_year,
    emissions_attributable_for_compliance: parseDecimal(
      data.emissions_attributable_for_compliance,
    ),
    emissions_limit: parseDecimal(data.emissions_limit),
    excess_emissions: parseDecimal(data.excess_emissions),
    obligation_id: data.obligation_id,
    compliance_charge_rate: chargeRate,
    equivalent_value: parseDecimal(data.excess_emissions) * chargeRate,
    outstanding_balance: parseDecimal(data.excess_emissions),
  };

  return pageData;
};
