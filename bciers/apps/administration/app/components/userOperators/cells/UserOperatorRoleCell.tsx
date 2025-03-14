"use client";

import { Status } from "@bciers/utils/src/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

export default function UserOperatorRoleCell(params: GridRenderCellParams) {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [Status.PENDING, "primary"],
    [Status.APPROVED, "success"],
    [Status.DECLINED, "error"],
  ]);
  const status =
    params.value === Status.APPROVED ? "Administrator" : params.value;
  const statusColor = colorMap.get(params.value) || "primary";

  return (
    <Chip
      label={
        // whiteSpace: "normal" is needed to wrap the text in the chip for multi-line statuses like "Changes Requested"
        <div style={{ color: statusColor, fontSize: "0.9em" }}>{status}</div>
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
