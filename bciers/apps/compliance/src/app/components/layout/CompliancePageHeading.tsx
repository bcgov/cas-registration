import getOperationByComplianceSummaryId from "@/compliance/src/app/utils/getOperationByComplianceSummaryId";

interface Props {
  complianceSummaryId: string;
}

export const CompliancePageHeading = async ({ complianceSummaryId }: Readonly<Props>) => {
  const operation = await getOperationByComplianceSummaryId(complianceSummaryId);
  return (
    <div className="container mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
        {operation.name}
      </h2>
    </div>
  );
};

export default CompliancePageHeading;
