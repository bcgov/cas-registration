import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const isAllowedCas = ["cas_director", "cas_analyst"].includes(frontEndRole);

  return (
    <ComplianceSummariesDataGrid
      initialData={initialData}
      isAllowedCas={isAllowedCas}
    />
  );
}
