import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";
import { ReactNode } from "react";
import CompliancePageHeading from "@/compliance/src/app/components/layout/CompliancePageHeading";

interface Props {
  complianceReportVersionId: number;
  taskListElements: TaskListElement[];
  children: ReactNode;
}

const CompliancePageLayout: ({
  complianceReportVersionId,
  taskListElements,
  children,
}: Readonly<Props>) => JSX.Element = ({
  complianceReportVersionId,
  taskListElements,
  children,
}: Readonly<Props>) => {
  return (
    <div>
      <div className="container mx-auto pb-4">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
          <CompliancePageHeading
            compliance_report_version_id={complianceReportVersionId}
          />
        </h2>
      </div>
      <div className="w-full flex">
        <div className="hidden md:block">
          <ComplianceSummaryTaskList elements={taskListElements} />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default CompliancePageLayout;
