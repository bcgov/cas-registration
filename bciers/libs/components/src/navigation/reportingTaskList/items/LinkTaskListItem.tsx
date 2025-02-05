import { TaskListItemProps } from "../types";
import { ListItem, ListItemButton, Typography } from "@mui/material";
import { BC_GOV_PRIMARY_BRAND_COLOR_BLUE } from "@bciers/styles";
import { BackIcon } from "@bciers/components/icons/BackIcon";

const LinkTaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
  if (item.type !== "Link" || !item.link || !item.text) {
    return <ListItem>Error: Invalid Link Item</ListItem>;
  }

  return (
    <ListItem sx={{ pl: 5, pb: 2 }}>
      <ListItemButton
        component="a"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BackIcon />
        <Typography
          sx={{
            color: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
            textDecoration: "underline",
          }}
        >
          {item.text}
        </Typography>
      </ListItemButton>
    </ListItem>
  );
};

export default LinkTaskListItem;
