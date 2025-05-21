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
      className={`w-fit mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300`}
      style={{ width: "320px" }}
    >
      <List component="div" disablePadding>
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
