import React from "react";
import { Typography } from "@mui/material";
import {
  BC_GOV_SEMANTICS_GREEN,
  BC_GOV_SEMANTICS_RED,
  WHITE,
} from "@bciers/styles";

interface StatusLabelProps {
  type: "added" | "deleted" | "modified";
}

export const StatusLabel: React.FC<StatusLabelProps> = ({ type }) => {
  const getBgColor = () => {
    switch (type) {
      case "added":
        return BC_GOV_SEMANTICS_GREEN;
      case "deleted":
        return BC_GOV_SEMANTICS_RED;
      default:
        return "warning.main";
    }
  };

  return (
    <Typography
      component="span"
      sx={{
        ml: 2,
        px: 2,
        py: 0.5,
        borderRadius: 1,
        fontSize: "0.875rem",
        fontWeight: "bold",
        color: WHITE,
        bgcolor: getBgColor(),
      }}
    >
      ({type.toUpperCase()})
    </Typography>
  );
};

export default StatusLabel;
