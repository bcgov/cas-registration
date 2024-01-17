"use client";

import { Status } from "@/app/utils/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

export const statusStyle = (params: GridRenderCellParams) => {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [Status.MYSELF, "primary"],
    [Status.PENDING, "primary"],
    [Status.APPROVED, "success"],
    [Status.REJECTED, "error"],
    [Status.CHANGES_REQUESTED, "error"],
  ]);

  const statusColor = colorMap.get(params.value) || "primary";

  return (
    <Chip
      label={params.value}
      variant="outlined"
      color={statusColor}
      sx={{ width: "fit-content", minWidth: 90 }}
    ></Chip>
  );
};
