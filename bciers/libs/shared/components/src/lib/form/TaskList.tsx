import { useEffect, useState } from "react";
import CheckCircle from "@bciers/components/icons/CheckCircle";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";

export interface TaskListProps {
  taskListData: {
    section: string;
    title: string;
  }[];
  taskListStatus: {
    [key: string]: boolean;
  };
}

const TaskList = ({ taskListData, taskListStatus }: TaskListProps) => {
  const [activeTask, setActiveTask] = useState(taskListData[0].section);
  const [anchorTarget, setAnchorTarget] = useState(null as HTMLElement | null);

  useEffect(() => {
    // Smooth scroll to the active task
    anchorTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [anchorTarget]);

  const handleTaskClick = (e: React.MouseEvent, section: string) => {
    // Prevent the default anchor link behavior so that the page doesn't jump
    e.preventDefault();
    setActiveTask(section);
    setAnchorTarget(document.getElementById(section));
  };

  return (
    <nav className="w-[256px] mr-4 h-fit border-solid border-0 border-r-2 border-[#f0f0f0]">
      {taskListData.map((task, index) => {
        const { section, title } = task;
        const taskStatus = taskListStatus?.[section];
        const isActive = activeTask === section;
        return (
          <div
            key={index}
            className={`flex items-center px-2.5 py-2 mb-2  transition-colors ease-in duration-200 ${
              isActive
                ? `bg-[#1a5a960c] border-solid border-0 border-r-2 border-[${BC_GOV_LINKS_COLOR}]`
                : "bg-transparent"
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
          </div>
        );
      })}
    </nav>
  );
};

export default TaskList;
