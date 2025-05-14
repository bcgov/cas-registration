"use client";

import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { useState } from "react";
import getAttachmentsList from "../../../utils/getAttachmentsList";
import { attachmentsGridColumns } from "./columns";

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
}

const buildColumnGroupModel = (
  columns: GridColDef[],
  lastFocusedField: string | null,
  setLastFocusedField: (val: string | null) => void,
): GridColumnGroupingModel => {
  const SearchCell = HeaderSearchCell({
    lastFocusedField,
    setLastFocusedField,
  });

  return columns.map((column) => ({
    groupId: column.field,
    headerName: column.headerName,
    renderHeaderGroup: SearchCell,
    children: [{ field: column.field }],
  }));
};

const AttachmentsListGrid: React.FC<Props> = ({ initialData }) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const columnGroupModel: GridColumnGroupingModel = buildColumnGroupModel(
    attachmentsGridColumns,
    lastFocusedField,
    setLastFocusedField,
  );

  return (
    <DataGrid
      columns={attachmentsGridColumns}
      columnGroupModel={columnGroupModel}
      fetchPageData={getAttachmentsList}
      initialData={initialData}
      paginationMode="server"
    />
  );
};

export default AttachmentsListGrid;
