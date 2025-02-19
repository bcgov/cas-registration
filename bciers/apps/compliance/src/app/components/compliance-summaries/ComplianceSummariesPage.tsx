import { ComplianceSummariesSearchParams } from "./types";
import ComplianceSummaries from "./ComplianceSummaries";

export default async function ComplianceSummariesPage({
  searchParams,
}: {
  searchParams: ComplianceSummariesSearchParams;
}) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Compliance Summaries</h2>
      </div>
      <ComplianceSummaries searchParams={searchParams} />
    </>
  );
} 