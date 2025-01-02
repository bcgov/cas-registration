"use client";

import { ReportOperationStatus } from "@bciers/utils/src/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

export default function ReportingOperationStatusCell(
  params: GridRenderCellParams,
) {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [ReportOperationStatus.NOT_STARTED, "primary"],
    [ReportOperationStatus.DRAFT, "primary"],
    [ReportOperationStatus.SUBMITTED, "success"],
  ]);
  const status = params.value || ReportOperationStatus.NOT_STARTED;
  const statusColor = colorMap.get(status) || "primary";
  const isMultiLineStatus = status === ReportOperationStatus.NOT_STARTED;

  // Adjust the font size for multi-line statuses so it will fit in the chip
  const fontSize = isMultiLineStatus ? "14px" : "16px";
  return (
    <Chip
      label={
        // whiteSpace: "normal" is needed to wrap the text in the chip for multi-line statuses like "Not started"
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
