import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import DataGridBasePage from "@/registry/app/components/dashboard/DataGridBasePage";
import type { DashboardSearchParams } from "@/registry/app/components/dashboard/types";
import AccountsPage from "@/registry/app/components/dashboard/AccountsPage";
import ProjectsPage from "@/registry/app/components/dashboard/ProjectsPage";
import IssuancesPage from "@/registry/app/components/dashboard/IssuancesPage";
import HoldingsPage from "@/registry/app/components/dashboard/HoldingsPage";
import RetirementsPage from "@/registry/app/components/dashboard/RetirementsPage";
import CancellationsPage from "@/registry/app/components/dashboard/CancellationsPage";
import TransfersPage from "@/registry/app/components/dashboard/TransfersPage";
import AnalyticsPage from "@/registry/app/components/dashboard/AnalyticsPage";

const sections = [
  "accounts",
  "projects",
  "issuances",
  "holdings",
  "retirements",
  "cancellations",
  "transfers",
  "analytics",
] as const;

type RegistrySection = (typeof sections)[number];

const sectionPages = {
  accounts: AccountsPage,
  projects: ProjectsPage,
  issuances: IssuancesPage,
  holdings: HoldingsPage,
  retirements: RetirementsPage,
  cancellations: CancellationsPage,
  transfers: TransfersPage,
  analytics: AnalyticsPage,
} satisfies Record<RegistrySection, typeof AccountsPage>;

function getSectionIndex(section: string): number {
  const sectionIndex = sections.indexOf(section as RegistrySection);
  return sectionIndex === -1 ? 0 : sectionIndex;
}

function RegistrySectionPage({
  section,
  searchParams,
}: {
  section: string;
  searchParams: DashboardSearchParams;
}) {
  const SectionPage = sectionPages[section as RegistrySection] ?? AccountsPage;

  return (
    <DataGridBasePage activeTab={getSectionIndex(section)}>
      <div className="flex flex-col">
        <SectionPage searchParams={searchParams} />
      </div>
    </DataGridBasePage>
  );
}

export default defaultPageFactory(RegistrySectionPage);