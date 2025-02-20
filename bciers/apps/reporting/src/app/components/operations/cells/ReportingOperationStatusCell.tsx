"use client";

import { ReportOperationStatus } from "@bciers/utils/src/enums";
import { GridRenderCellParams } from "@mui/x-data-grid";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_SEMANTICS_GREEN,
} from "@bciers/styles";

export default function ReportingOperationStatusCell(
  params: GridRenderCellParams,
) {
  const colorMap = new Map<string, string>([
    [ReportOperationStatus.NOT_STARTED, BC_GOV_PRIMARY_BRAND_COLOR_BLUE],
    [ReportOperationStatus.DRAFT, BC_GOV_PRIMARY_BRAND_COLOR_BLUE],
    [ReportOperationStatus.SUBMITTED, BC_GOV_SEMANTICS_GREEN],
  ]);
  const status = params.value || ReportOperationStatus.NOT_STARTED;
  const statusColor = colorMap.get(status) || "primary";
  return (
    <div
      style={{
        whiteSpace: "normal",
        fontSize: "16px",
        color: statusColor,
      }}
    >
      {status}
    </div>
  );
}
