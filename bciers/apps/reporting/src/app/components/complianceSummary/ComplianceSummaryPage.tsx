import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import type { ReportProductCompliance } from "@reporting/src/app/types";
import { isOperationOptedOut } from "@bciers/utils/src/isOperationOptedOut";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const response = await getComplianceData(version_id);

  const { payload, report_data, facility_data, operation_data } = response;

  const facilityId = facility_data?.facility_id;
  const reportingYear = report_data.reporting_year;

  const isOptedOut = isOperationOptedOut({
    operationOptedOutFinalReportingYear:
      operation_data?.operation_opted_out_final_reporting_year,
    reportingYear,
  });

  const navInfo = await getNavigationInformation(
    HeaderStep.ComplianceSummary,
    ReportingPage.ComplianceSummary,
    version_id,
    facilityId ?? "",
  );

  const formData = {
    emissions_attributable_for_reporting: String(
      payload.emissions_attributable_for_reporting,
    ),
    reporting_only_emissions: String(payload.reporting_only_emissions),
    emissions_attributable_for_compliance: String(
      payload.emissions_attributable_for_compliance,
    ),
    emissions_limit: String(payload.emissions_limit),
    excess_emissions: String(payload.excess_emissions),
    credited_emissions: String(payload.credited_emissions),
    regulatory_values: {
      initial_compliance_period: String(
        payload.regulatory_values.initial_compliance_period,
      ),
      compliance_period: String(payload.regulatory_values.compliance_period),
    },
    products: payload.products.map((p: ReportProductCompliance) => ({
      ...p,
      annual_production: String(p.annual_production),
      jan_mar_production: String(p.jan_mar_production),
      apr_dec_production: String(p.apr_dec_production),
      emission_intensity: String(p.emission_intensity),
      allocated_industrial_process_emissions: String(
        p.allocated_industrial_process_emissions,
      ),
      allocated_compliance_emissions: String(p.allocated_compliance_emissions),
      reduction_factor: String(p.reduction_factor),
      tightening_rate: String(p.tightening_rate),
    })),
    reporting_year: report_data.reporting_year,
    isOptedOut: isOptedOut,
  };

  return (
    <ComplianceSummaryForm
      summaryFormData={formData}
      navigationInformation={navInfo}
    />
  );
}
