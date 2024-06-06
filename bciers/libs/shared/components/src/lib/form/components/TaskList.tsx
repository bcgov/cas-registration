import { useState } from "react";
import CheckCircle from "@bciers/components/icons/CheckCircle";

export interface TaskListProps {
  taskListItems: {
    section: string;
    title: string;
  }[];
  taskListItemStatus: {
    [section: string]: boolean;
  };
}

const TaskList = ({ taskListItems, taskListItemStatus }: TaskListProps) => {
  const [activeTask, setActiveTask] = useState(taskListItems[0].section);

  const handleTaskClick = (e: React.MouseEvent, section: string) => {
    // Prevent the default anchor link behavior so that the page doesn't jump
    e.preventDefault();
    setActiveTask(section);
    // prepend root_ to the section to match the id of the anchor target
    const anchorTarget = document.getElementById(`root_${section}`);
    anchorTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="w-[256px] mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300">
      {taskListItems.map((task) => {
        const { section, title } = task;
        const taskStatus = taskListItemStatus?.[section];
        const isActive = activeTask === section;
        return (
          <button
            key={title ?? section}
            className={`w-full text-lg flex items-center px-2.5 py-2 mb-2 transition-all ease-in duration-200 border-solid border-0 border-r-2 ${
              isActive
                ? `bg-[#1a5a960c] border-bc-link-blue`
                : "bg-transparent border-transparent"
            } hover:bg-bc-light-grey-200`}
            onClick={(e) => handleTaskClick(e, section)}
          >
            <div
              className={`min-w-4 mr-2.5 flex align-middle `}
              data-testid={`${section}-tasklist-check`}
            >
              {taskStatus && <CheckCircle />}
            </div>
            <span
              className={`no-underline ${
                isActive ? "text-bc-link-blue" : "text-bc-text"
              }`}
            >
              {title ?? section}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TaskList;
