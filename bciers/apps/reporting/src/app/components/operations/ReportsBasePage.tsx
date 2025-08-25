import { Tabs } from "@bciers/components/tabs/Tabs";
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
  const tabs = [
    { label: "View annual reports", href: "/reports/current-reports" },
    { label: "View past reports", href: "/reports/previous-years" },
  ];
  const CURRENT_REPORTS_TAB_INDEX = 0;
  const PREVIOUS_REPORTS_TAB_INDEX = 1;
  const reportingYearObj = await getReportingYear();
  const reportDueDate = reportingYearObj.report_due_date;
  const reportDueyearOnly = dayjs(reportDueDate).year();
  const pageTitle =
    activeTab === CURRENT_REPORTS_TAB_INDEX
      ? `Reporting year ${reportingYearObj.reporting_year}`
      : "Past Reports";

  return (
    <div className="py-4">
      <div className="flex flex-col">
        {activeTab === CURRENT_REPORTS_TAB_INDEX && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{pageTitle}</h2>
            <h3 className="text-bc-text text-right">
              Reports due May 31, {reportDueyearOnly}
            </h3>
          </div>
        )}
        {activeTab === PREVIOUS_REPORTS_TAB_INDEX && (
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
