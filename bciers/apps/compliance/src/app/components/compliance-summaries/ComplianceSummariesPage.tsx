import { ComplianceSummariesSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: ComplianceSummariesSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);

  return <ComplianceSummariesDataGrid initialData={initialData} />;
}
