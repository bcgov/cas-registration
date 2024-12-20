"use client";

import MultiStepHeader from "./components/MultiStepHeader";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import NavigationForm, { NavigationFormProps } from "./NavigationForm";
import { Box } from "@mui/material";

interface Props extends NavigationFormProps {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
}

const MultiStepFormWithTaskList: React.FC<Props> = (props) => {
  const { initialStep, steps, taskListElements } = props;

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      <div className="w-full flex">
        {/* Make the task list hidden on small screens and visible on medium and up */}
        <div className="hidden md:block">
          <ReportingTaskList elements={taskListElements} />
        </div>
        <div className="w-full">
          <NavigationForm {...props} />
        </div>
      </div>
    </Box>
  );
};

export default MultiStepFormWithTaskList;
