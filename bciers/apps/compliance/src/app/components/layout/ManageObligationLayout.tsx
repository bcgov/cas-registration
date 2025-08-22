import type { ReactNode } from "react";
import { ElicensingStaleDataAlert } from "@/compliance/src/app/components/alerts/ElicensingStaleDataAlert";
import { getElicensingLastRefreshMetaData } from "@/compliance/src/app/utils/getElicensingLastRefreshMetaData";
import { ElicensingLastRefreshData } from "@/compliance/src/app/types";

type Props = {
  complianceReportVersionId: number;
  children: ReactNode;
};

export default async function ManageObligationLayout({
  complianceReportVersionId,
  children,
}: Props) {
  const meta: ElicensingLastRefreshData =
    await getElicensingLastRefreshMetaData(complianceReportVersionId);

  return (
    <div className="min-h-screen">
      <ElicensingStaleDataAlert
        lastUpdated={meta?.last_refreshed_display ?? ""}
        dataIsFresh={meta?.data_is_fresh ?? false}
      />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
