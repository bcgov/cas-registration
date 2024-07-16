// Test

import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";

type TaskListRenderer = (elt: TaskListElement) => any;

const renderElement: TaskListRenderer = (elt) => (
  <ListItem disablePadding>
    <ListItemButton>
      <ListItemText primary={elt.type} secondary={elt.title} />
    </ListItemButton>
  </ListItem>
);

const renderers: { [key: string]: TaskListRenderer } = {
  Section: renderElement,
  SubSection: renderElement,
  Page: renderElement,
};

interface TaskListElement {
  type: "Section" | "SubSection" | "Page";
  title: string;
  elements?: TaskListElement[];
  isComplete?: boolean;
  isOpen?: boolean;
}

const data: TaskListElement[] = [
  {
    type: "Section",
    title: "Facility 1 info",
    elements: [
      { type: "Page", title: "Review information", isComplete: true },
      {
        type: "SubSection",
        title: "Activities information",
        elements: [
          { type: "Page", title: "General stationary combustion" },
          { type: "Page", title: "Mobile combustion" },
        ],
      },
      { type: "Page", title: "Non-attributable emissions" },
    ],
  },
  {
    type: "Section",
    title: "Facility 2 info",
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
];

const ReportingListItem: React.FC<{ item: TaskListElement }> = ({ item }) => {
  const [open, setOpen] = useState<boolean>(item.isOpen ?? false);

  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItem>
        <ListItemButton onClick={handleClick}>
          <ListItemText primary={item.title} secondary={item.type} />
        </ListItemButton>
        {item.elements && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItem>
      {item.elements &&
        item.elements.map((elt) => <ReportingListItem item={elt} />)}
    </>
  );
};

const renderTaskList = (tasklist: TaskListElement[]) => {
  return (
    <>
      {tasklist.map((elt) => (
        <ReportingListItem item={elt}></ReportingListItem>
      ))}
    </>
  );
};

interface Props {}

const ReportingTaskList: React.FC<Props> = () => {
  return <nav>{renderTaskList(data)}</nav>;
};

export default ReportingTaskList;
