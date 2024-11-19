import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const tasklistData: TaskListElement[] = [
  {
    type: "Section",
    title: "Facility1 information",
    elements: [
      { type: "Page", title: "Review facility information", isActive: true },
      {
        type: "Subsection",
        title: "Activities information",
        isExpanded: true,
        elements: [
          { type: "Page", title: "Mobile combustion" },
          { type: "Page", title: "Alumina combustion" },
          { type: "Page", title: "Cement production" },
        ],
      },
      { type: "Page", title: "Non-attributable emissions" },
      { type: "Page", title: "Emissions Summary" },
      { type: "Page", title: "Production data" },
      { type: "Page", title: "Allocation of emissions" },
    ],
  },
];
