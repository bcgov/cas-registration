"use client";

import { Box } from "@mui/material";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";
import { PageContent } from "@/compliance/src/app/components/compliance-summary/compliance-summary-review/PageContent";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  title?: string;
  hideTaskList?: boolean;
  formData: any;
  backUrl: string;
  continueUrl: string;
  onChange: any;
  onSubmit: any;
  // errors: any;
  noSaveButton: any;
}

const CompliancePageLayout: React.FC<Props> = (props) => {
  const {
    backUrl,
    continueUrl,
    formData,
    taskListElements,
    title = "Compliance Summary",
  } = props;

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="compliance-review">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">{title}</h2>
      </div>
      <div className="w-full flex">
        <div className="hidden md:block">
          <ComplianceSummaryTaskList elements={taskListElements} />
        </div>
        <div className="w-full">
          <PageContent
            data={formData}
            backUrl={backUrl}
            continueUrl={continueUrl}
          />
        </div>
      </div>
    </Box>
  );
};

export default CompliancePageLayout;
