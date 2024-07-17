import ReportingTaskList from "@bciers/components/navigation/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/ReportingTaskListItem";

const data: TaskListElement[] = [
  {
    type: "Page",
    title: "main page element",
  },
  {
    type: "Section",
    title: "Facility 1 info",
    elements: [
      { type: "Page", title: "Review information", isChecked: true },
      {
        type: "SubSection",
        title: "Activities information",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "General stationary combustion",
          },
          { type: "Page", title: "Mobile combustion", isActive: true },
          { type: "Page", title: "...", isChecked: true },
        ],
      },
      { type: "Page", title: "Non-attributable emissions" },
    ],
  },
  {
    type: "Section",
    title: "Facility 2 info",
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
  {
    type: "Section",
    title: "Facility 3 info",
    isChecked: true,
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
  { type: "Page", title: "New entrant information", isChecked: true },
  { type: "Page", title: "Operation emission summary with a long title" },
];

export default function Demo() {
  return (
    <div>
      <ReportingTaskList elements={data} />
    </div>
  );
}
