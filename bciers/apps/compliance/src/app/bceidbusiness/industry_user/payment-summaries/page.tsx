import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Page from "@/compliance/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";

const title = "Payment Summaries";
export const metadata = generateMetadata(title);

export default defaultPageFactory(() => {
  return <Page activeTab={1} />;
});
