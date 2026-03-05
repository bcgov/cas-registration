import { Tabs } from "@bciers/components/tabs/Tabs";
import ReportingYearHeader from "@bciers/components/reporting/ReportingYearHeader";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import type { ReactNode } from "react";
import { getReportingYear } from "@bciers/actions/api";

interface ReportsBasePageProps {
  activeTab: number;
  children?: ReactNode;
}

export default async function ReportsBasePage({
  activeTab,
  children,
}: Readonly<ReportsBasePageProps>) {
  const userRole = await getSessionRole();
  const isIndustryUser = userRole.includes("industry_");

  const reportingYearData = await getReportingYear();

  const tabs = isIndustryUser
    ? [
        //tabs for external users
        { label: "View annual report(s)", href: "/reports/current-reports" },
        { label: "View past reports", href: "/reports/previous-years" },
      ]
    : [
        //tabs for internal users
        { label: "View annual reports", href: "/reports/current-reports" },
        { label: "View past reports", href: "/reports/previous-years" },
        { label: "Download report attachments", href: "/reports/attachments" },
      ];

  const CURRENT_REPORTS_TAB_INDEX = 0;
  const PAST_REPORTS_TAB_INDEX = 1;
  const ATTACHMENTS_TAB_INDEX = 2;

  const isCurrentReportsTab = activeTab === CURRENT_REPORTS_TAB_INDEX;

  const getPageTitle = () => {
    switch (activeTab) {
      case CURRENT_REPORTS_TAB_INDEX:
        return `Reporting year ${reportingYearData.reporting_year}`;
      case PAST_REPORTS_TAB_INDEX:
        return "Past Reports";
      case ATTACHMENTS_TAB_INDEX:
        return "Download Report Attachments";
      default:
        return "Reports";
    }
  };

  const pageTitle = getPageTitle();

  return (
    <div className="py-4">
      <div className="flex flex-col">
        {isCurrentReportsTab && isIndustryUser ? (
          <ReportingYearHeader
            reportingYear={reportingYearData.reporting_year}
            reportDueYear={reportingYearData.report_due_year}
            variant="inline"
          />
        ) : (
          <h2 className="text-2xl font-bold">{pageTitle}</h2>
        )}

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
