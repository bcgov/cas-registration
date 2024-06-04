import { useState } from "react";
import CheckCircle from "@bciers/components/icons/CheckCircle";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";

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
    const anchorTarget = document.getElementById(section);
    anchorTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="w-[256px] mr-4 h-fit border-solid border-0 border-r-2 border-[#f0f0f0]">
      {taskListItems.map((task) => {
        const { section, title } = task;
        const taskStatus = taskListItemStatus?.[section];
        const isActive = activeTask === section;
        return (
          <button
            key={title}
            className={`w-full text-lg flex items-center px-2.5 py-2 mb-2 transition-all ease-in duration-200 border-solid border-0 border-r-2 ${
              isActive
                ? `bg-[#1a5a960c] border-[${BC_GOV_LINKS_COLOR}]`
                : "bg-transparent border-transparent"
            }`}
            onClick={(e) => handleTaskClick(e, section)}
          >
            <div className={`min-w-4 mr-2.5 flex align-middle `}>
              {taskStatus && <CheckCircle />}
            </div>
            <a
              className={`no-underline ${
                isActive ? "text-bc-link-blue" : "text-bc-text"
              }`}
              href={`#${section}`}
            >
              {title}
            </a>
          </button>
        );
      })}
    </nav>
  );
};

export default TaskList;
