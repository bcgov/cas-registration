import { TaskListElement } from "../types";
import NullTaskListItem from "./NullTaskListItem";
import PageTaskListItem from "./PageTaskListItem";
import SectionTaskListItem from "./SectionTaskListItem";
import LinkTaskListItem from "@bciers/components/navigation/reportingTaskList/items/LinkTaskListItem";

const taskListItemFactory = (elt: TaskListElement) => {
  if (elt.type === "Section" || elt.type === "Subsection")
    return SectionTaskListItem;
  if (elt.type === "Page") return PageTaskListItem;
  if (elt.type === "Link") return LinkTaskListItem;
  return NullTaskListItem;
};

export default taskListItemFactory;
