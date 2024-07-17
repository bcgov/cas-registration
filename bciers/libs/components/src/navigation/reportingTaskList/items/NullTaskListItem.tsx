import { TaskListItemProps } from "../types";
import { ListItem } from "@mui/material";

const NullTaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
  return (
    <ListItem>
      Error: No task list item component found for {item.type}
    </ListItem>
  );
};

export default NullTaskListItem;
