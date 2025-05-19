import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewPage";

export default function Page({
  params,
}: {
  params: { compliance_summary_id: string };
}) {
  return (
    <ComplianceSummaryReviewPage
      compliance_summary_id={params.compliance_summary_id}
    />
  );
}
