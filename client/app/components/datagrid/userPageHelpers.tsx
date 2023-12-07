"use client";

import { Chip, ChipOwnProps } from "@mui/material";
import { GridValueGetterParams } from "@mui/x-data-grid";

const capitalizeFirstLetter = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1);

export const statusStyle = (params: GridValueGetterParams) => {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    ["myself", "primary"],
    ["pending", "primary"],
    ["approved", "success"],
    ["rejected", "error"],
  ]);

  const statusColor = colorMap.get(params.value) || "primary";

  return (
    <Chip
      label={capitalizeFirstLetter(params.value)}
      variant="outlined"
      color={statusColor}
      sx={{ mx: "auto", width: 90 }}
    ></Chip>
  );
};
