"use client";

import { Role } from "@bciers/utils/src/enums";
import { useTheme } from "@mui/material/styles";
import { GridRenderCellParams } from "@mui/x-data-grid";

function titleCase(str: string) {
  var splitStr = str.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}

export default function UserOperatorRoleCell(params: GridRenderCellParams) {
  // Use MUI theme colours
  const theme = useTheme();
  const colorMap = new Map<string, string>([
    [Role.PENDING, theme.palette.primary.main],
    [Role.ADMIN, theme.palette.success.main],
    [Role.REPORTER, theme.palette.success.main],
  ]);

  const role = params.value === Role.ADMIN ? "Administrator" : params.value;
  const roleColor = colorMap.get(params.value) || "primary";

  return (
    <span style={{ color: roleColor, textTransform: "capitalize" }}>
      {role}
    </span>
  );
}
