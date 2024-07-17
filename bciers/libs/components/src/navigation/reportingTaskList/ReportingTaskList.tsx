"use client";

import { List } from "@mui/material";
import { TaskListElement } from "./types";
import taskListItemFactory from "./items/taskListItemFactory";

interface Props {
  elements: TaskListElement[];
}

const ReportingTaskList: React.FC<Props> = ({ elements }) => {
  return (
    <nav
      className={`w-fit mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300`}
      style={{ width: "350px" }}
    >
      <List component="div" disablePadding sx={{ pl: 2 }}>
        {elements.map((elt) => {
          const TaskListItem = taskListItemFactory(elt);
          return (
            <TaskListItem item={elt} elementFactory={taskListItemFactory} />
          );
        })}
      </List>
    </nav>
  );
};

export default ReportingTaskList;
