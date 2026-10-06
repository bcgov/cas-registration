import React from "react";
import { Typography } from "@mui/material";
import { BC_GOV_SEMANTICS_GREEN, BC_GOV_SEMANTICS_RED } from "@bciers/styles";

interface StatusLabelProps {
  type: "added" | "deleted" | "modified" | "removed";
}

export const StatusLabel: React.FC<StatusLabelProps> = ({ type }) => {
  const getBgColor = () => {
    switch (type) {
      case "added":
        return BC_GOV_SEMANTICS_GREEN;
      case "deleted":
      case "removed":
        return BC_GOV_SEMANTICS_RED;
      default:
        return "warning.main";
    }
  };

  // "removed" from the API is displayed as "DELETED" to the user
  const label = type === "removed" ? "DELETED" : type.toUpperCase();

  return (
    <Typography
      component="span"
      className="ml-4 px-4 py-1 rounded-sm text-[0.875rem] font-bold text-white"
      sx={{ bgcolor: getBgColor() }}
    >
      ({label})
    </Typography>
  );
};

export default StatusLabel;
