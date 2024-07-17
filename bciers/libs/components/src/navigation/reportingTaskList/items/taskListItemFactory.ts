import { TaskListElement } from "../types";
import NullTaskListItem from "./NullTaskListItem";
import PageTaskListItem from "./PageTaskListItem";
import SectionTaskListItem from "./SectionTaskListItem";

const taskListItemFactory = (elt: TaskListElement) => {
  if (elt.type === "Section" || elt.type === "SubSection")
    return SectionTaskListItem;
  if (elt.type === "Page") return PageTaskListItem;
  return NullTaskListItem;
};

export default taskListItemFactory;
