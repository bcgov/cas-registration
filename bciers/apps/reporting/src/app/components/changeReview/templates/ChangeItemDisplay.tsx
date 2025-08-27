import React from "react";
import { Box, Typography, Grid, Divider } from "@mui/material";
import { ChangeItem } from "../constants/types";
import { ChangeValueBox } from "./ChangeValueBox";
import { getContextualLabel } from "../utils/utils";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";

interface ChangeItemDisplayProps {
  item: ChangeItem & { displayLabel?: string };
  context?: string;
  isDeleted?: boolean;
}

export const ChangeItemDisplay: React.FC<ChangeItemDisplayProps> = ({
  item,
  context,
  isDeleted = false,
}) => {
  const isDeletedItem = item.change_type === "deleted" || isDeleted;

  // Use displayLabel if provided, otherwise generate a clean label
  const fieldLabel =
    item.displayLabel || getContextualLabel(item.field, context);

  return (
    <Box key={item.field} mb={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <Typography
            fontWeight={500}
            sx={{
              textDecoration: isDeleted ? "line-through" : "none",
              color: isDeleted ? "#666" : "inherit",
            }}
          >
            {fieldLabel}
            {isDeletedItem && <StatusLabel type="deleted" />}
            {item.isNewAddition && <StatusLabel type="added" />}
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <ChangeValueBox
            oldValue={item.oldValue}
            newValue={item.newValue}
            changeType={item.change_type}
            isDeleted={isDeleted}
          />
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};
