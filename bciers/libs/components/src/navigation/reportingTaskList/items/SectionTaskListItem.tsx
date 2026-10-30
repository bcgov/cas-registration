import { useState } from "react";
import { TaskListElement, TaskListItemProps } from "../types";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircle from "@bciers/components/icons/CheckCircle";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const SectionTaskListItem: React.FC<TaskListItemProps> = ({
  item,
  elementFactory,
}) => {
  const hasExpandedChild: (elt: TaskListElement) => boolean = (elt) => {
    return (
      elt.isExpanded || elt.elements?.some((e) => hasExpandedChild(e)) || false
    );
  };

  const [open, setOpen] = useState<boolean>(hasExpandedChild(item));
  const handleClick = () => setOpen(!open);

  // The child list and divider live inside this <li> so the parent <ul> only has <li> children
  return (
    <ListItem className="block">
      <div className="flex items-center min-h-10">
        <ListItemButton onClick={handleClick} selected={item.isActive}>
          <ListItemIcon>{item.isChecked && <CheckCircle />}</ListItemIcon>
          <ListItemText
            primary={item.title}
            slotProps={{
              primary:
                item.type === "Section" ? { className: "font-bold" } : {},
            }}
          />
          {item.elements && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </div>
      <Collapse in={open}>
        <List disablePadding className="pl-4">
          {item.elements &&
            item.elements.map((elt) => {
              const TaskListChildItem = elementFactory(elt);
              return (
                <TaskListChildItem
                  key={elt.key ?? elt.title}
                  item={elt}
                  elementFactory={elementFactory}
                />
              );
            })}
        </List>
      </Collapse>
      {item.type === "Section" && <Divider variant="inset" />}
    </ListItem>
  );
};

export default SectionTaskListItem;
