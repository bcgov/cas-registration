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

  return (
    <>
      <ListItem>
        <ListItemButton onClick={handleClick} selected={item.isActive}>
          <ListItemIcon>{item.isChecked && <CheckCircle />}</ListItemIcon>
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
    </>
  );
};

export default SectionTaskListItem;
