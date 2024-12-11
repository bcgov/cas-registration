"use client";

import { UserOperatorDataGridRow } from "apps/administration/app/components/userOperators/types";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo, useState } from "react";
import userOperatorColumns from "@/administration/app/components/datagrid/models/userOperators/userOperatorColumns";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import userOperatorGroupColumns from "@/administration/app/components/datagrid/models/userOperators/userOperatorGroupColumns";
import getUserOperatorsPageData from "@/administration/app/components/userOperators/getUserOperatorsPageData";
import { GridRenderCellParams } from "@mui/x-data-grid";

const UserOperatorsActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `/operator-administrators-and-access-requests/${params.row.id}?title=Request ID: ${params.row.user_friendly_id}`;
  },
  cellText: "View Details",
});

const UserOperatorDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: UserOperatorDataGridRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );
  const ActionCell = useMemo(() => UserOperatorsActionCell, []);

  const columns = useMemo(() => userOperatorColumns(ActionCell), []);
  const columnGroup = useMemo(
    () => userOperatorGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      initialData={initialData}
      columns={columns}
      columnGroupModel={columnGroup}
      paginationMode="server"
      fetchPageData={getUserOperatorsPageData}
    />
  );
};

export default UserOperatorDataGrid;
