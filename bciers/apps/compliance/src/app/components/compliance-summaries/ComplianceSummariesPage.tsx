import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontEndRoles } from "@bciers/utils/src/enums";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const isAllowedCas = [
    FrontEndRoles.CAS_DIRECTOR,
    FrontEndRoles.CAS_ANALYST,
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.CAS_VIEW_ONLY,
  ].includes(frontEndRole);

  return (
    <ComplianceSummariesDataGrid
      initialData={initialData}
      isAllowedCas={isAllowedCas}
    />
  );
}
