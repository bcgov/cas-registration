import { HasComplianceReportVersion } from "../../types";
import getOperationByComplianceReportVersionId from "../../utils/getOperationByComplianceReportVersionId";

export const CompliancePageHeading = async ({
  compliance_report_version_id: complianceReportVersionId,
}: Readonly<HasComplianceReportVersion>) => {
  const operation = await getOperationByComplianceReportVersionId(
    complianceReportVersionId,
  );
  console.log(
    "getOperationByComplianceReportVersionId",
    getOperationByComplianceReportVersionId,
  );
  console.log("operation", operation);
  return (
    <div className="container mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
        {operation.name}
      </h2>
    </div>
  );
};

export default CompliancePageHeading;
