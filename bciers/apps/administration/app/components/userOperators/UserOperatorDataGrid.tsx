"use client";

import { UserOperatorDataGridRow } from "apps/administration/app/components/userOperators/types";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo, useState } from "react";
import userOperatorColumns from "@/administration/app/components/datagrid/models/userOperators/userOperatorColumns";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import userOperatorGroupColumns from "@/administration/app/components/datagrid/models/userOperators/userOperatorGroupColumns";
import getUserOperatorsPageData from "@/administration/app/components/userOperators/getUserOperatorsPageData";

const UserOperatorsActionCell = ActionCellFactory({
  generateHref: () => {
    return "TBD"; // Will be implemented in a future ticket by using `params: GridRenderCellParams`
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
