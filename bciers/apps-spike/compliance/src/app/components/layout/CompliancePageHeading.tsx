import { HasComplianceReportVersion } from "../../types";
import { getComplianceSummary } from "../../utils/getComplianceSummary";

export const CompliancePageHeading = async ({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) => {
  const operation = await getComplianceSummary(complianceReportVersionId);
  return (
    <div className="container mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
        {operation.operation_name}
      </h2>
    </div>
  );
};

export default CompliancePageHeading;
