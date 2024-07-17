export interface TaskListElement {
  type: "Section" | "SubSection" | "Page";
  title: string;
  link?: string;
  elements?: TaskListElement[];
  isChecked?: boolean;
  isExpanded?: boolean;
  isActive?: boolean;
}

export interface TaskListItemProps {
  item: TaskListElement;
  elementFactory: (item: TaskListElement) => React.FC<TaskListItemProps>;
}
