import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";

interface Props {
  readonly taskListElements: TaskListElement[];
}

export default function PaymentInstructionsDownloadComponent({
  taskListElements,
}: Props) {
  return (
    <div>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
          Pink Operation
        </h2>
      </div>
      <div className="w-full flex">
        <div className="hidden md:block">
          <ComplianceSummaryTaskList elements={taskListElements} />
        </div>
        <div className="w-full">PaymentInstructionsDownload ...TBD</div>
      </div>
    </div>
  );
}
