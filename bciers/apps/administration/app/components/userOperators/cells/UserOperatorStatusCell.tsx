"use client";

import { Status } from "@bciers/utils/src/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

export default function UserOperatorStatusCell(params: GridRenderCellParams) {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [Status.PENDING, "primary"],
    [Status.APPROVED, "success"],
    [Status.DECLINED, "error"],
  ]);
  const status =
    params.value === Status.APPROVED ? "Admin Access" : params.value;
  const statusColor = colorMap.get(params.value) || "primary";
  const isMultiLineStatus = status === Status.APPROVED;

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
}
