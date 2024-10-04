"use client";

import { AccessRequestDataGridRow } from "@/administration/app/components/userOperators/types";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo } from "react";
import accessRequestColumns from "@/administration/app/components/datagrid/models/userOperators/accessRequestColumns";

const AccessRequestDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: AccessRequestDataGridRow[];
  };
}) => {
  const columns = useMemo(() => accessRequestColumns(), []);
  return <DataGrid initialData={initialData} columns={columns} />;
};

export default AccessRequestDataGrid;
