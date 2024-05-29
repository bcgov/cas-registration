"use client";

import { useMemo, useState } from "react";
<<<<<<<< HEAD:bciers/apps/registration1/app/components/operations/OperationDataGrid.tsx
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@bciers/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "@/app/components/datagrid/models/operationColumns";
import operationGroupColumns from "@/app/components/datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
========
import DataGrid from "@shared/components/src/lib/layout/DataGrid";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@shared/components/src/lib/datagrid/cells/OperationActionCell";
import HeaderSearchCell from "@shared/components/src/lib/datagrid/cells/HeaderSearchCell";
import operationColumns from "@reporting/src/app/components/datagrid/models/operationColumns";
import operationGroupColumns from "@shared/components/src/lib/datagrid/models/operationGroupColumns";
import { OperationRow } from "@shared/components/src/operations/type";
>>>>>>>> 25097e07 (chore: move components to shared library and fix references, rename OperationDataGrid -> ReportingOperationDataGrid for clarity):bciers/apps/reporting/src/app/components/operations/ReportingOperationDataGrid.tsx
import { fetchOperationsPageData } from "./Operations";

const OperationSearchCell = ({
  lastFocusedField,
  setLastFocusedField,
}: {
  lastFocusedField: string | null;
  setLastFocusedField: (value: string | null) => void;
}) => {
  const RenderCell = (params: GridColumnGroupHeaderParams) => {
    const { groupId, headerName } = params;
    return (
      <HeaderSearchCell
        field={groupId as string}
        fieldLabel={headerName as string}
        isFocused={lastFocusedField === groupId}
        setLastFocusedField={setLastFocusedField}
      />
    );
  };
  return RenderCell;
};

const ReportingOperationDataGrid = ({
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
    () => OperationSearchCell({ lastFocusedField, setLastFocusedField }),
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

export default ReportingOperationDataGrid;
