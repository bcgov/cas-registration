import { generateMetadata } from "@bciers/components/layout/RootLayout";
import ComplianceNavigationPage from "@/compliance/app/components/compliance-navigation/ComplianceNavigationPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

const title = "Compliance Summaries";
export const metadata = generateMetadata(title);

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ComplianceNavigationPage activeTab={0} />
    </Suspense>
  );
}
