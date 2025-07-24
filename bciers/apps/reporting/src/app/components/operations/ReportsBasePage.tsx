import { Tabs } from "@bciers/components/tabs/Tabs";
import { ReactNode } from "react";

interface ReportsBasePageProps {
  activeTab: number;
  children?: ReactNode;
}

export default async function ReportsBasePage({
  activeTab,
  children,
}: Readonly<ReportsBasePageProps>) {
  const tabs = [
    { label: "Submit annual report(s)", href: "/reports/current-reports" },
    { label: "View past reports", href: "/reports/previous-years" },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-bc-bg-blue">Reports</h2>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          aria-label="reports navigation tabs"
        />
        {children}
      </div>
    </div>
  );
}
