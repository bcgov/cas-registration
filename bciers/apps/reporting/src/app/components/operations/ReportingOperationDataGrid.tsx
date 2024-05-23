"use client";

import { useMemo, useState } from "react";
import DataGrid from "@shared/components/src/lib/layout/DataGrid";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@shared/components/src/lib/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@shared/components/src/lib/datagrid/cells/HeaderSearchCell";
import operationColumns from "@reporting/src/app/components/datagrid/models/operationColumns";
import operationGroupColumns from "@shared/components/src/lib/datagrid/models/operationGroupColumns";
import { OperationRow } from "@reporting/src/app/components/operations/types";
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
}: {
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

  const columns = useMemo(() => operationColumns(ActionCell), [ActionCell]);

  const columnGroup = useMemo(
    () => operationGroupColumns(false, SearchCell),
    [SearchCell],
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
