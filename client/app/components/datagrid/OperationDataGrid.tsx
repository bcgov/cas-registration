"use client";

import { useMemo, useState } from "react";
import DataGrid from "./DataGrid";
import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { fetchOperationsPageData } from "@/app/components/routes/operations/Operations";
import { useSession } from "next-auth/react";
import OperationsActionCell from "@/app/components/datagrid/cells/OperationsActionCell";
import EmptyGroupCell from "@/app/components/datagrid/cells/EmptyGroupCell";
import HeaderSearchCell from "@/app/components/datagrid/cells/HeaderSearchCell";
import StatusStyleColumnCell from "@/app/components/datagrid/cells/StatusStyleColumnCell";
import { OperationRow } from "@/app/components/routes/operations/types";

const operatorColumnIndex = 1;

const operationColumns = (
  isOperatorColumn: boolean,
  ActionCell: (params: GridRenderCellParams) => JSX.Element,
) => {
  const columns = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: isOperatorColumn ? 320 : 560,
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: isOperatorColumn ? 200 : 220,
    },
    {
      field: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      width: isOperatorColumn ? 160 : 220,
    },
    {
      field: "status",
      headerName: "Application Status",
      width: 130,
      renderCell: StatusStyleColumnCell,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ];

  if (isOperatorColumn) {
    columns.splice(operatorColumnIndex, 0, {
      field: "operator",
      headerName: "Operator",
      width: 320,
    });
  }

  return columns;
};

const operationGroupColumns = (
  isOperatorColumn: boolean,
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    {
      groupId: "bcghg_id",
      headerName: "BC GHG ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bcghg_id" }],
    },
    {
      groupId: "name",
      headerName: "Operation",
      renderHeaderGroup: SearchCell,
      children: [{ field: "name" }],
    },
    {
      groupId: "submission_date",
      headerName: "Submission Date",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "submission_date" }],
    },
    {
      groupId: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      renderHeaderGroup: SearchCell,
      children: [{ field: "bc_obps_regulated_operation" }],
    },
    {
      groupId: "status",
      headerName: "Application Status",
      renderHeaderGroup: SearchCell,
      children: [{ field: "status" }],
    },
    {
      groupId: "action",
      headerName: "Action",
      renderHeaderGroup: EmptyGroupCell,
      children: [{ field: "action" }],
    },
  ] as GridColumnGroupingModel;

  if (isOperatorColumn) {
    columnGroupModel.splice(operatorColumnIndex, 0, {
      groupId: "operator",
      headerName: "Operator",
      renderHeaderGroup: SearchCell,
      children: [{ field: "operator" }],
    });
  }

  return columnGroupModel;
};

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
