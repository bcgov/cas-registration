import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import { CheckCircle } from "@bciers/components/icons";

interface TaskListElement {
  type: "Section" | "SubSection" | "Page";
  title: string;
  elements?: TaskListElement[];
  isComplete?: boolean;
  isOpen?: boolean;
  isActive?: boolean;
}

const data: TaskListElement[] = [
  {
    type: "Page",
    title: "main page element",
  },
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
          { type: "Page", title: "Mobile combustion", isActive: true },
          { type: "Page", title: "...", isComplete: true },
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
  {
    type: "Section",
    title: "Facility 3 info",
    isComplete: true,
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
  { type: "Page", title: "New entrant information", isComplete: true },
  { type: "Page", title: "Operation emission summary" },
];

const ReportingListItem: React.FC<{ item: TaskListElement }> = ({ item }) => {
  const [open, setOpen] = useState<boolean>(item.isOpen ?? false);

  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItem>
        <ListItemButton onClick={handleClick} selected={item.isActive}>
          <ListItemIcon>{item.isComplete && <CheckCircle />}</ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={
              item.type === "Section" ? { fontWeight: "bold" } : {}
            }
          />
          {item.elements && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
      <Collapse in={open}>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {item.elements &&
            item.elements.map((elt) => <ReportingListItem item={elt} />)}
        </List>
      </Collapse>
      {item.type === "Section" && <Divider variant="inset" />}
    </>
  );
};

const renderTaskList = (tasklist: TaskListElement[]) => {
  return (
    <List component="div" disablePadding sx={{ pl: 2 }}>
      {tasklist.map((elt) => (
        <ReportingListItem item={elt}></ReportingListItem>
      ))}
    </List>
  );
};

interface Props {}

const ReportingTaskList: React.FC<Props> = () => {
  return (
    <nav
      className={`w-fit mr-4 h-fit border-solid border-0 border-r-2 border-bc-light-grey-300`}
    >
      {renderTaskList(data)}
    </nav>
  );
};

export default ReportingTaskList;
