import { TaskListItemProps } from "../types";
import { ListItem } from "@mui/material";

const NullTaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
  return <ListItem>Error: Type not found {item.type}</ListItem>;
};

export default NullTaskListItem;
