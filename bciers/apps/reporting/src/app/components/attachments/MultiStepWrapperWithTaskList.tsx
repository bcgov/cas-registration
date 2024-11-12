"use client";

import React from "react";

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { Box } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  children?: React.ReactNode;
}

const MultiStepWrapperWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  children,
}) => {
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
        <div className="w-full">{children}</div>
      </div>
    </Box>
  );
};

export default MultiStepWrapperWithTaskList;
