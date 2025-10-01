import type { ReactNode } from "react";
import ManageObligationLayout from "@/compliance/src/app/components/layout/ManageObligationLayout";

export default function ManageObligationRouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { compliance_report_version_id: string };
}) {
  const id = Number(params.compliance_report_version_id);
  return (
    <ManageObligationLayout complianceReportVersionId={id}>
      {children}
    </ManageObligationLayout>
  );
}
