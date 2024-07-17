"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@/app/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "@/app/components/datagrid/models/operationColumns";
import operationGroupColumns from "@/app/components/datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
import { fetchOperationsPageData } from "./Operations";

const OperationDataGrid = ({
  initialData,
  isOperatorColumn = false,
}: {
  isOperatorColumn?: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
}) => {
  const { data: session } = useSession();
  const isIndustryUser = session?.user?.app_role?.includes("industry") ?? false;
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(
    () => OperationsActionCell(isIndustryUser),
    [isIndustryUser],
  );

  const columns = useMemo(
    () => operationColumns(isOperatorColumn, ActionCell),
    [ActionCell, isOperatorColumn],
  );

  const columnGroup = useMemo(
    () => operationGroupColumns(isOperatorColumn, SearchCell),
    [SearchCell, isOperatorColumn],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
