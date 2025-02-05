export interface TaskListElement {
  type: "Section" | "Subsection" | "Page" | "Link";
  title: string;
  key?: string; // Overrides the key used for React when building the list of children elements. Defaults to the title.
  link?: string;
  elements?: TaskListElement[];
  isChecked?: boolean;
  isExpanded?: boolean;
  isActive?: boolean;
  text?: string;
}

export interface TaskListItemProps {
  item: TaskListElement;
  elementFactory: (item: TaskListElement) => React.FC<TaskListItemProps>;
}
