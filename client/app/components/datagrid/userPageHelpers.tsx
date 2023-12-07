"use client";

import { Button, ButtonOwnProps } from "@mui/material";
import { GridValueGetterParams } from "@mui/x-data-grid";

export const statusStyle = (params: GridValueGetterParams) => {
  const colorMap = new Map<string, ButtonOwnProps["color"]>([
    ["myself", "primary"],
    ["pending", "primary"],
    ["approved", "success"],
    ["rejected", "error"],
  ]);

  const statusColor = colorMap.get(params.value) || "primary";

  return (
    <Button variant="outlined" color={statusColor} sx={{ borderRadius: 32 }}>
      {params.value}
    </Button>
  );
};
