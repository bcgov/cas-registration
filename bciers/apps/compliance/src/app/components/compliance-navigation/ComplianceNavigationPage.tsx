import { Tabs } from "@bciers/components/tabs/Tabs";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { ReactNode } from "react";

interface ComplianceNavigationPageProps {
  activeTab: number;
  children?: ReactNode;
}

export default async function ComplianceNavigationPage({
  activeTab,
  children,
}: Readonly<ComplianceNavigationPageProps>) {
  const userRole = await getSessionRole();
  const isCasStaff = userRole.startsWith("cas_");

  const tabs = isCasStaff
    ? [
        { label: "Compliance Summaries", href: "/compliance-summaries" },
        { label: "Invoices", href: "/invoices" },
        // TODO: Add Imposed Penalties tab in task #80
      ]
    : [{ label: "Compliance Summaries", href: "/compliance-summaries" }];

  const title = isCasStaff ? "Compliance Administration" : "My Compliance";
  return (
    <div className="py-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-bc-bg-blue">{title}</h2>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          aria-label="compliance navigation tabs"
        />
        {children}
      </div>
    </div>
  );
}
