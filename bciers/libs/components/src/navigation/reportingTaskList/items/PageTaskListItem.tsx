import { useRouter } from "next/navigation";
import { TaskListItemProps } from "../types";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircle from "@bciers/components/icons/CheckCircle";

const PageTaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
  const router = useRouter();
  const handleClick = () => router.push(item.link ?? "#");

  return (
    <ListItem>
      <ListItemButton onClick={handleClick} selected={item.isActive}>
        <ListItemIcon>{item.isChecked && <CheckCircle />}</ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItemButton>
    </ListItem>
  );
};

export default PageTaskListItem;
