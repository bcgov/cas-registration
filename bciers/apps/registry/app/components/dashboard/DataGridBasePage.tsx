import { Tabs } from "@bciers/components/tabs/Tabs";
import type { ReactNode } from "react";
import Cards from "./Cards";
import SerialNumberSearchBar from "./SerialNumberSearchBar";

interface DataGridBasePageProps {
  activeTab: number;
  children?: ReactNode;
}

export default async function DataGridBasePage({
  activeTab,
  children,
}: Readonly<DataGridBasePageProps>) {
  const tabs = [
    { label: "Accounts", href: "/accounts" },
    { label: "Projects", href: "/projects" },
    { label: "Issuances", href: "/issuances" },
    { label: "Holdings", href: "/holdings" },
    { label: "Retirements", href: "/retirements" },
    { label: "Cancellations", href: "/cancellations" },
    { label: "Transfers", href: "/transfers" },
    { label: "Analytics", href: "/analytics" },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">BC Carbon Registry</h2>
          <p>
            The BC Carbon Registry is established under the Greenhouse Gas
            Industrial Reporting and Control Act. The BC Carbon Registry enables
            the issuance, transfer and retirement of compliance units used to
            fulfill the compliance obligation of regulated operations under the
            Act, and supports the Province of British Columbia&apos;s annual
            commitment to have a carbon neutral public sector.
          </p>
        </div>
        <div className="space-y-16">
          <SerialNumberSearchBar />
          <Cards />
        </div>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          aria-label="registry navigation tabs"
        />
        {children}
      </div>
    </div>
  );
}
