import { Tabs } from "@bciers/components/tabs/Tabs";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { ReactNode } from "react";
import { getReportingYear } from "../../utils/getReportingYear";
import dayjs from "dayjs";

interface ReportsBasePageProps {
  activeTab: number;
  children?: ReactNode;
}

export default async function ReportsBasePage({
  activeTab,
  children,
}: Readonly<ReportsBasePageProps>) {
  const userRole = await getSessionRole();

  const reportingYearObj = await getReportingYear();
  const reportDueDate = reportingYearObj.report_due_date;
  const reportDueYearOnly = dayjs(reportDueDate).year();

  const tabs = userRole.includes("industry_")
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

  let pageTitle = "";
  switch (activeTab) {
    case CURRENT_REPORTS_TAB_INDEX:
      pageTitle = `Reporting year ${reportingYearObj.reporting_year}`;
      break;
    case PAST_REPORTS_TAB_INDEX:
      pageTitle = "Past Reports";
      break;
    case ATTACHMENTS_TAB_INDEX:
      pageTitle = "Download Report Attachments";
      break;
    default:
      pageTitle = "Reports";
  }

  return (
    <div className="py-4">
      <div className="flex flex-col">
        {activeTab === CURRENT_REPORTS_TAB_INDEX && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{pageTitle}</h2>
            {userRole.includes("industry_") && (
              <h3 className="text-bc-text text-right">
                Reports due May 31, {reportDueYearOnly}
              </h3>
            )}
          </div>
        )}
        {activeTab !== CURRENT_REPORTS_TAB_INDEX && (
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
