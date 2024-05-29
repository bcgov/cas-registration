import CheckCircle from "@components/icons/CheckCircle";

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
  return (
    <nav className="w-[200px]">
      {taskListData.map((task, index) => {
        const { href, section, title } = task;
        const taskStatus = taskListStatus?.[section];
        return (
          <div key={index} className="flex items-center justify-between">
            <CheckCircle />
            <a
              className={`${
                taskStatus ? "text-bc-bg-dark-grey" : "text-bc-link-blue"
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
