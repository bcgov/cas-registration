"use client";

import { ReportOperationStatus } from "@bciers/utils/src/enums";
import { GridRenderCellParams } from "@mui/x-data-grid";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_SEMANTICS_GREEN,
} from "@bciers/styles";

export default function StatusCell(params: GridRenderCellParams) {
  const colorMap = new Map<string, string>([
    [ReportOperationStatus.NOT_STARTED, BC_GOV_PRIMARY_BRAND_COLOR_BLUE],
    [ReportOperationStatus.DRAFT, BC_GOV_PRIMARY_BRAND_COLOR_BLUE],
    [
      ReportOperationStatus.DRAFT_SUPPLEMENTARY,
      BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
    ],
    [ReportOperationStatus.SUBMITTED, BC_GOV_SEMANTICS_GREEN],
    [ReportOperationStatus.SUBMITTED_SUPPLEMENTARY, BC_GOV_SEMANTICS_GREEN],
  ]);
  const status =
    params.row.report_version_id > params.row.first_report_version_id
      ? `${params.value} Supplementary Report`
      : params.value || ReportOperationStatus.NOT_STARTED;
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
