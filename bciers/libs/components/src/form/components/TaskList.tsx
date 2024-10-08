import { useState } from "react";

export interface TaskListProps {
  className?: string;
  taskListItems: {
    section: string;
    title: string;
  }[];
}

const TaskList: React.FC<TaskListProps> = ({ className, taskListItems }) => {
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
    <nav
      className={`w-fit mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300 ${className}`}
    >
      {taskListItems.map((task) => {
        const { section, title } = task;
        const isActive = activeTask === section;
        return (
          <button
            key={title ?? section}
            className={`w-full text-lg flex items-center px-2.5 py-2 mr-4 mb-2 transition-all ease-in duration-200 border-solid border-0 border-r-2 ${
              isActive
                ? `bg-[#1a5a960c] border-bc-link-blue`
                : "bg-transparent border-transparent"
            } hover:bg-bc-light-grey-200`}
            onClick={(e) => handleTaskClick(e, section)}
          >
            <span
              className={`no-underline whitespace-nowrap ${
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
