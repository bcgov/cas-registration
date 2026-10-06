import { Status } from "@bciers/utils/src/enums";
import { Chip, ChipOwnProps } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { inferStatus } from "./ActionColumnCell";

export default function InternalUserStatusColumnCell(
  params: GridRenderCellParams,
) {
  const colorMap = new Map<string, ChipOwnProps["color"]>([
    [Status.PENDING, "primary"],
    [Status.APPROVED, "success"],
    [Status.DECLINED, "error"],
  ]);
  const { role, archived_at: archivedAt } = params.row;

  // Status is only in the params if added by the ActionColumnCell's handleButtonClick.
  const status = params?.row.status || inferStatus(role, archivedAt);
  const statusColor = status ? colorMap.get(status) : "primary";

  return (
    <Chip
      label={
        <div
          className="text-[16px]"
          style={{ color: status ? colorMap.get(status) : "primary" }}
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
