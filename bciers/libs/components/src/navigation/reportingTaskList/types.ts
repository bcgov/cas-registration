export interface TaskListElement {
  type: "Section" | "Subsection" | "Page";
  title: string;
  key?: string; // Overrides the key used for React when building the list of children elements. Defaults to the title.
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
