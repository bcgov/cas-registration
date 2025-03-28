// import { ComplianceSummary } from "@/compliance/src/app/components/compliance-summaries/types";
// import { actionHandler } from "@bciers/actions";

export const getComplianceSummary = async () => {
  // TODO: Uncomment this code after the backend is implemented
  /*
    const data = await actionHandler(
        `compliance/summaries/${compliance_summary_id}`,
        "GET",
        "",
    );

    if (data?.error) {
        throw new Error(`Failed to fetch compliance summary: ${data.error}`);
    }

    if (!data || typeof data !== "object") {
        throw new Error(
            "Invalid response format from compliance summary endpoint",
        );
    }

    return data;
    */

  // Mock data for development - remove when backend is implemented
  const mock = {
    operation_name: "Operation 2",

    reporting_year: 2024,
    emissions_attributable_for_compliance: "8000.0000",
    emission_limit: "8000.0000",
    excess_emissions: 0.0,

    obligation_id: "24-0001-1-1",
    compliance_change_rate: 80.0,
    equivalent_value: 0, // calculated in schema excess_emissions * compliance_change_rate

    // Penalty information
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

  return mock;
};
