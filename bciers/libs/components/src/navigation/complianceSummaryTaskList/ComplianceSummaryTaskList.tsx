"use client";

import { List } from "@mui/material";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import taskListItemFactory from "@bciers/components/navigation/reportingTaskList/items/taskListItemFactory";

interface Props {
  elements: TaskListElement[];
}

const ComplianceSummaryTaskList: React.FC<Props> = ({ elements }) => {
  return (
    <nav
      aria-label="Compliance summary tasks"
      className="w-80 mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300"
    >
      <List disablePadding>
        {elements.map((elt) => {
          const TaskListItem = taskListItemFactory(elt);
          return (
            <TaskListItem
              key={elt.key ?? elt.title}
              item={elt}
              elementFactory={taskListItemFactory}
            />
          );
        })}
      </List>
    </nav>
  );
};

export default ComplianceSummaryTaskList;
