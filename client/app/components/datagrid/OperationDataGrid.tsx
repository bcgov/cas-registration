"use client";

import DataGrid from "./DataGrid";
import Link from "next/link";
import {
  GridColumnGroupingModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { fetchOperationsPageData } from "@/app/components/routes/operations/Operations";
import { useSession } from "next-auth/react";
import { OperationStatus } from "@/app/utils/enums";
import StatusStyleColumnCell from "@/app/components/datagrid/cells/StatusStyleColumnCell";
import HeaderSearchCell from "@/app/components/datagrid/cells/HeaderSearchCell";

const OperationDataGrid = ({
  initialData,
  isOperatorColumn = false,
}: {
  isOperatorColumn?: boolean;
  initialData: {
    rows: any;
    row_count: number;
  };
}) => {
  const { data: session } = useSession();
  const isIndustryUser = session?.user.app_role?.includes("industry");

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
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ];

  const columnGroup = [
    {
      groupId: "bcghg_id",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },
      children: [{ field: "bcghg_id" }],
    },
    {
      groupId: "operator",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },
      children: [{ field: "operator" }],
    },
    {
      groupId: "name",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },
      children: [{ field: "name" }],
    },
    {
      groupId: "submission_date",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },

      children: [{ field: "submission_date" }],
    },
    {
      groupId: "bc_obps_regulated_operation",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },
      children: [{ field: "bc_obps_regulated_operation" }],
    },
    {
      groupId: "status",
      renderHeaderGroup: (params) => {
        return <HeaderSearchCell field={params.groupId as string} />;
      },
      children: [{ field: "status" }],
    },
    {
      groupId: "action",
      headerName: "Action",
      children: [{ field: "action" }],
    },
  ] as GridColumnGroupingModel;

  const operatorColumnIndex = 1;

  if (isOperatorColumn) {
    // Add the operator column if the user is CAS internal
    columns.splice(operatorColumnIndex, 0, {
      field: "operator",
      headerName: "Operator",
      width: 320,
    });
  }

  const updatedColumnsOperations = columns.map((column) => {
    if (column.field === "action") {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => {
          let actionText;
          switch (params.row.status) {
            case OperationStatus.NOT_STARTED:
              actionText = "Start Registration";
              break;
            case OperationStatus.DRAFT:
              actionText = "Continue";
              break;
            default:
              actionText = "View Details";
          }

          return (
            <div>
              {/* 🔗 Add link with href query parameter with row's descriptive text*/}
              <Link
                className="no-underline text-bc-link-blue whitespace-normal"
                href={{
                  pathname: `operations/${params.row.id}${
                    isIndustryUser ? "/1" : ""
                  }`,
                  query: {
                    title: `${params.row.name}`,
                  },
                }}
                replace={true}
              >
                {actionText}
              </Link>
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <DataGrid
      columns={updatedColumnsOperations}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
