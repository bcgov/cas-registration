"use client";

import { Status } from "@bciers/utils/src/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

export default function StatusStyleColumnCell(params: GridRenderCellParams) {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [Status.MYSELF, "success"],
    [Status.PENDING, "primary"],
    [Status.APPROVED, "success"],
    [Status.CHANGES_REQUESTED, "info"],
    [Status.NOT_STARTED, "secondary"],
    [Status.DRAFT, "secondary"],
    [Status.DECLINED, "error"],
  ]);
  const status =
    params.value === Status.MYSELF ? Status.APPROVED : (params.value as string);
  const statusColor = colorMap.get(params.value) || "primary";
  const isMultiLineStatus =
    status === Status.CHANGES_REQUESTED || status === Status.NOT_STARTED;

  // Adjust the font size for multi-line statuses so it will fit in the chip
  const fontSize = isMultiLineStatus ? "text-[14px]" : "text-[16px]";

  return (
    <Chip
      label={
        // whiteSpace: "normal" is needed to wrap the text in the chip for multi-line statuses like "Changes Requested"
        <div
          className={`whitespace-normal ${fontSize}`}
          style={{ color: statusColor }}
        >
          {status}
        </div>
      }
      variant="outlined"
      color={statusColor}
      className="w-25 h-10 rounded-[20px]"
    />
  );
}
