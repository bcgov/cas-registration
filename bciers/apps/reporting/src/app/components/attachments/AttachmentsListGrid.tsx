"use client";

import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { useState } from "react";
import getAttachmentsList from "../../utils/getAttachmentsList";

type Attachment = {
  id: number;
  operator: string;
  operation: string;
  report_version_id: number;
  attachment_id: number;
  attachment_type: string;
  attachment_name: string;
};

interface Props {
  initialData: {
    rows: Attachment[];
    row_count: number;
  };
  columns: GridColDef[];
}

const AttachmentsListGrid: React.FC<Props> = ({
  initialData,
  columns: columns,
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const columnGroupModel: GridColumnGroupingModel = [
    {
      groupId: "operator",
      headerName: "Operator",
      renderHeaderGroup: HeaderSearchCell({
        lastFocusedField,
        setLastFocusedField,
      }),
      children: [{ field: "operator" }],
    },
    {
      groupId: "operation",
      headerName: "Operation",
      renderHeaderGroup: HeaderSearchCell({
        lastFocusedField,
        setLastFocusedField,
      }),
      children: [{ field: "operation" }],
    },
    {
      groupId: "report_version_id",
      headerName: "Version ID",
      renderHeaderGroup: HeaderSearchCell({
        lastFocusedField,
        setLastFocusedField,
      }),
      children: [{ field: "report_version_id" }],
    },
    {
      groupId: "attachment_type",
      headerName: "Type",
      renderHeaderGroup: HeaderSearchCell({
        lastFocusedField,
        setLastFocusedField,
      }),
      children: [{ field: "attachment_type" }],
    },
    {
      groupId: "attachment_name",
      headerName: "Download",
      renderHeaderGroup: HeaderSearchCell({
        lastFocusedField,
        setLastFocusedField,
      }),
      children: [{ field: "attachment_name" }],
    },
  ];

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroupModel}
      fetchPageData={getAttachmentsList}
      initialData={initialData}
      paginationMode="server"
    />
  );
};

export default AttachmentsListGrid;
