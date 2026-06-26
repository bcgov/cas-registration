import { generateMetadata } from "@bciers/components/layout/RootLayout";
import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import VerificationStatementAnalysis from "@reporting/src/app/components/verificationStatementAnalysis/VerificationStatementAnalysis";
import type { Metadata } from "next";

const title = "Verification Statement Analysis";
export const metadata: Metadata = generateMetadata(title);

function VerificationStatementAnalysisPage() {
  return (
    <div className="flex flex-col p-4">
      <VerificationStatementAnalysis />
    </div>
  );
}

export default defaultPageFactory(VerificationStatementAnalysisPage);
