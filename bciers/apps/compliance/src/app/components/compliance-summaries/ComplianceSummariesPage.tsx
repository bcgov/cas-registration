import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import getReportVersionIDsWithActionedECs from "@/compliance/src/app/utils/getReportVersionIDsWithActionedECs";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const isCasStaff = frontEndRole.startsWith("cas_");
  const actionedECReportVersionIDs = await getReportVersionIDsWithActionedECs();

  return (
    <ComplianceSummariesDataGrid
      initialData={initialData}
      isCasStaff={isCasStaff}
      actionedECReportVersionIDs={actionedECReportVersionIDs}
    />
  );
}
