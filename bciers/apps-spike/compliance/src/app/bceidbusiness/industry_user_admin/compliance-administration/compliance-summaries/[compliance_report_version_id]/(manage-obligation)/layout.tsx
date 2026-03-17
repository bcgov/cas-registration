import type { ReactNode } from "react";
import ManageObligationLayout from "@/compliance/src/app/components/layout/ManageObligationLayout";

export default async function ManageObligationRouteLayout(props: {
  children: ReactNode;
  params: Promise<{ compliance_report_version_id: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const id = Number(params.compliance_report_version_id);
  return (
    <ManageObligationLayout complianceReportVersionId={id}>
      {children}
    </ManageObligationLayout>
  );
}
