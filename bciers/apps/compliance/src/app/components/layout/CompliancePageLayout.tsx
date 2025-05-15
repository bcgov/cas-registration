import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";

interface Props {
  taskListElements: TaskListElement[];
  title?: string;
  children?: React.ReactNode;
}

const CompliancePageLayout: React.FC<Props> = (props) => {
  const { taskListElements, title, children } = props;

  return (
    <div>
      <div className="container mx-auto pb-4" data-testid="compliance-review">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">{title}</h2>
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
