"use client";

import DataGrid from "@/app/components/datagrid/DataGrid";

const UserOperatorDataGrid = ({
  rows,
  columns,
}: {
  rows: any[];
  columns: any[];
}) => {
  return <DataGrid rows={rows} columns={columns} />;
};

export default UserOperatorDataGrid;
