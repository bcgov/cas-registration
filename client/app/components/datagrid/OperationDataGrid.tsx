"use client";

import { useMemo, useState } from "react";
import DataGrid from "./DataGrid";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import { fetchOperationsPageData } from "@/app/components/routes/operations/Operations";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@/app/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@/app/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "@/app/components/datagrid/models/operationColumns";
import operationGroupColumns from "@/app/components/datagrid/models/operationGroupColumns";
import { OperationRow } from "@/app/components/routes/operations/types";

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
  const isIndustryUser = session?.user.app_role?.includes("industry") ?? false;
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    // eslint-disable-next-line react/display-name
    () => (params: GridColumnGroupHeaderParams) => {
      const { groupId, headerName } = params;
      return (
        <HeaderSearchCell
          field={groupId as string}
          fieldLabel={headerName as string}
          isFocused={lastFocusedField === groupId}
          setLastFocusedField={setLastFocusedField}
        />
      );
    },
    [lastFocusedField],
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
