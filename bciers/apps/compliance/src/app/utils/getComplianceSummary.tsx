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
  operation_name: string;
  reporting_year: number;
  emissions_attributable_for_compliance: number;
  emission_limit: number;
  excess_emissions: number;
  obligation_id: string;
  compliance_charge_rate: number;
  equivalent_value: number;
  penalty_status?: string;
  penalty_type?: string;
  penalty_rate_daily?: number;
  days_late?: number;
  accumulated_penalty?: number;
  accumulated_compounding?: number;
  penalty_today?: number;
  faa_interest?: number;
  total_amount?: number;
}

const parseDecimal = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
};

export const getComplianceSummary = async (
  complianceReportVersionId: number,
): Promise<ComplianceSummary> => {
  const data = await actionHandler(
    `compliance/compliance-report-version/${complianceReportVersionId}`,
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
    emission_limit: parseDecimal(data.emission_limit),
    excess_emissions: parseDecimal(data.excess_emissions),
    obligation_id: data.obligation_id,
    compliance_charge_rate: chargeRate,
    equivalent_value: parseDecimal(data.excess_emissions) * chargeRate,
    outstanding_balance: parseDecimal(data.excess_emissions),
    penalty_status: "Accruing",
    penalty_type: "Automatic Overdue",
    penalty_rate_daily: 0.38,
    days_late: 3,
    accumulated_penalty: 91.2,
    accumulated_compounding: 0.35,
    penalty_today: 91.55,
    faa_interest: 0.0,
    total_amount: 91.55,
  };

  return pageData;
};
