"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo } from "react";
import { InternalAccessRequestDataGridRow } from "./types";
import internalAccessRequestColumns from "../datagrid/models/users/internalAccessRequestColumns";

const InternalAccessRequestDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: InternalAccessRequestDataGridRow[];
    row_count: number;
  };
}) => {
  const columns = useMemo(() => internalAccessRequestColumns(), []);
  return (
    <DataGrid
      initialData={initialData}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
};

export default InternalAccessRequestDataGrid;
