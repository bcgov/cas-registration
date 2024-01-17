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
  ]);

  const statusColor = colorMap.get(params.value) || "primary";
  const isMultiLineStatus = params.value === Status.CHANGES_REQUESTED;
  // Adjust the font size for multi-line statuses so it will fit in the chip
  const fontSize = isMultiLineStatus ? "14px" : "16px";

  return (
    <Chip
      label={
        // whiteSpace: "normal" is needed to wrap the text in the chip for multi-line statuses like "Changes Requested"
        <div style={{ whiteSpace: "normal", color: statusColor, fontSize }}>
          {params.value}
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

// Use this to display text with "\n" line breaks in a DataGrid cell
export const lineBreakStyle = (params: GridRenderCellParams) => {
  return <div style={{ whiteSpace: "pre-line" }}>{params.value}</div>;
};
