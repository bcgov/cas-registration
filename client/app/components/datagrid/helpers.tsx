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
    [Status.CHANGES_REQUESTED, "info"],
    [Status.NOT_REGISTERED, "secondary"],
  ]);
  const status = params.value as string;
  const statusColor = colorMap.get(params.value) || "primary";
  const isMultiLineStatus =
    status === Status.CHANGES_REQUESTED || status === Status.NOT_REGISTERED;

  // Adjust the font size for multi-line statuses so it will fit in the chip
  const fontSize = isMultiLineStatus ? "14px" : "16px";

  return (
    <Chip
      label={
        // whiteSpace: "normal" is needed to wrap the text in the chip for multi-line statuses like "Changes Requested"
        <div style={{ whiteSpace: "normal", color: statusColor, fontSize }}>
          {status}
        </div>
      }
      variant="outlined"
      color={statusColor}
      sx={{
        width: 100,
        height: 40,
        borderRadius: "20px",
      }}
    />
  );
};
