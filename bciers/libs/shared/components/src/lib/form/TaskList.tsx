import { useState } from "react";
import CheckCircle from "@components/icons/CheckCircle";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";

export interface TaskListProps {
  taskListData: {
    href: string;
    section: string;
    title: string;
  }[];
  taskListStatus: {
    [key: string]: boolean;
  };
}

const TaskList = ({ taskListData, taskListStatus }: TaskListProps) => {
  const [activeTask, setActiveTask] = useState(taskListData[0].section);

  const handleTaskClick = (section: string) => {
    setActiveTask(section);
  };

  return (
    <nav className="w-[256px] mr-4 h-fit border-solid border-0 border-r-2 border-[#f0f0f0]">
      {taskListData.map((task, index) => {
        const { href, section, title } = task;
        const taskStatus = taskListStatus?.[section];
        const isActive = activeTask === section;
        return (
          <div
            key={index}
            className={`flex items-center p-2 mb-2  transition-colors ease-in duration-200 ${
              isActive
                ? `bg-[#1a5a960c] border-solid border-0 border-r-2 border-[${BC_GOV_LINKS_COLOR}]`
                : "bg-transparent"
            }`}
            onClick={() => handleTaskClick(section)}
          >
            <div className={`min-w-6 flex align-middle `}>
              {taskStatus && <CheckCircle />}
            </div>
            <a
              className={`no-underline ${
                isActive ? "text-bc-link-blue" : "text-bc-text"
              }`}
              href={href}
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
