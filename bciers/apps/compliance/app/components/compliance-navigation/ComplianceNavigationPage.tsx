import { Tabs } from "@bciers/components/tabs/Tabs";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";

interface ComplianceNavigationPageProps {
  activeTab: number;
}

export default function ComplianceNavigationPage({
  activeTab,
}: ComplianceNavigationPageProps) {
  const tabs = [
    { label: "Compliance Summaries", href: "/compliance-summaries" },
    { label: "Payment Summaries", href: "/payment-summaries" },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col">
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "Inter, sans-serif",
            lineHeight: "29.05px",
            letterSpacing: "0%",
            color: BC_GOV_LINKS_COLOR,
          }}
        >
          My Compliance
        </h2>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          aria-label="compliance navigation tabs"
        />
      </div>
    </div>
  );
}
