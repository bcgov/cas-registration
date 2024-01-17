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
  ]);

  const statusColor = colorMap.get(params.value) || "primary";

  return (
    <Chip
      label={params.value}
      variant="outlined"
      color={statusColor}
      sx={{ width: 90 }}
    ></Chip>
  );
};
