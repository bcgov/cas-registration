"use client";

import { UserOperatorDataGridRow } from "@/administration/app/components/userOperators/types";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useMemo } from "react";
import userOperatorColumns from "@/administration/app/components/datagrid/models/userOperators/userOperatorColumns";

const UserOperatorDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: UserOperatorDataGridRow[];
  };
}) => {
  const columns = useMemo(() => userOperatorColumns(), []);
  return <DataGrid initialData={initialData} columns={columns} />;
};

export default UserOperatorDataGrid;
