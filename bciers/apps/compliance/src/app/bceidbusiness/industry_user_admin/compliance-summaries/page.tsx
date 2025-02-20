import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { ComplianceSummariesSearchParams } from "@/compliance/src/app/components/compliance-summaries/types";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

const title = "Compliance Summaries";
export const metadata = generateMetadata(title);

export default async function Page({
  searchParams,
}: {
  searchParams: ComplianceSummariesSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ComplianceSummariesPage searchParams={searchParams} />
    </Suspense>
  );
}
