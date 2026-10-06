import { TaskListItemProps } from "../types";
import { ListItem, ListItemButton, Typography } from "@mui/material";
import BackIcon from "@bciers/components/icons/BackIcon";

const LinkTaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
  if (item.type !== "Link" || !item.link || !item.text) {
    return <ListItem>Error: Invalid Link Item</ListItem>;
  }

  return (
    <ListItem className="pl-10 pb-4">
      <ListItemButton
        component="a"
        href={item.link}
        rel="noopener noreferrer"
        className="[&_svg]:shrink-0"
      >
        <BackIcon />
        <Typography className="text-bc-primary-blue underline">
          {item.text}
        </Typography>
      </ListItemButton>
    </ListItem>
  );
};

export default LinkTaskListItem;
