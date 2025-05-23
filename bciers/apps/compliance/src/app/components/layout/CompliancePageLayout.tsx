import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";
import { ReactNode } from "react";
import CompliancePageHeading from "@/compliance/src/app/components/layout/CompliancePageHeading";

interface Props {
  complianceSummaryId: string;
  taskListElements: TaskListElement[];
  children: ReactNode;
}

const CompliancePageLayout: ({
  complianceSummaryId,
  taskListElements,
  children,
}: Readonly<Props>) => JSX.Element = ({
  complianceSummaryId,
  taskListElements,
  children,
}: Readonly<Props>) => {
  return (
    <div>
      <div className="container mx-auto pb-4">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
          <CompliancePageHeading complianceSummaryId={complianceSummaryId} />
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
