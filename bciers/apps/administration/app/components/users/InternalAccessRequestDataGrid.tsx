"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo } from "react";
import { InternalAccessRequestDataGridRow } from "./types";
import internalAccessRequestColumns from "../datagrid/models/users/internalAccessRequestColumns";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

const InternalAccessRequestDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: InternalAccessRequestDataGridRow[];
    row_count: number;
  };
}) => {
  const currentUserRole = useSessionRole();
  const columns = useMemo(
    () => internalAccessRequestColumns(currentUserRole),
    [],
  );
  return (
    <DataGrid
      initialData={initialData}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
};

export default InternalAccessRequestDataGrid;
