"use client";

import DataGrid from "./DataGrid";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import { OperationStatus } from "@/app/utils/enums";
import { formatOperationRows } from "../operations/Operations";

const fetchOperationPageData = async (
  page: number,
  sortField?: string,
  sortOrder?: string
) => {
  try {
    // fetch data from server
    const pageData = await actionHandler(
      `registration/operations?page=${page}&sort_field=${sortField}&sort_order=${sortOrder}`,
      "GET",
      ""
    );
    return formatOperationRows(pageData.data);
  } catch (error) {
    throw error;
  }
};

const OperationDataGrid = ({
  rows,
  rowCount,
  columns,
}: {
  rows: any[];
  columns: any[];
  rowCount: number;
}) => {
  const { data: session } = useSession();
  const isIndustryUser = session?.user.app_role?.includes("industry");

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
      fetchPageData={fetchOperationPageData}
      paginationMode="server"
      rows={rows}
      rowCount={rowCount}
    />
  );
};

export default OperationDataGrid;
