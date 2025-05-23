import { Tabs } from "@bciers/components/tabs/Tabs";
import { ReactNode } from "react";

interface ComplianceNavigationPageProps {
  activeTab: number;
  children?: ReactNode;
}

export default function ComplianceNavigationPage({
  activeTab,
  children,
}: Readonly<ComplianceNavigationPageProps>) {
  const tabs = [
    { label: "Compliance Summaries", href: "/compliance-summaries" },
    { label: "Payment Summaries", href: "/payment-summaries" },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-bc-bg-blue">My Compliance</h2>
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
