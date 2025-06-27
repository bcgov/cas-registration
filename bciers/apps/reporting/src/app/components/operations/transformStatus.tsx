import { ReportOperationStatus } from "@bciers/utils/src/enums";
import { OperationRow } from "./types";
export const transformStatus = (gridData: {
  rows: OperationRow[];
  row_count: number;
}) => {
  return {
    rows: gridData.rows.map((row: OperationRow) => ({
      ...row,
      report_status:
        row.report_status === ReportOperationStatus.DRAFT &&
        row.report_version_id > 1
          ? `${row.report_status} Supplementary Report`
          : row.report_status,
    })),
    row_count: gridData.row_count,
  };
};
