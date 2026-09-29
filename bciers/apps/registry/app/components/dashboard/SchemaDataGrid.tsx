"use client";

import { useMemo } from "react";
import type { RJSFSchema } from "@rjsf/utils";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import type { DashboardSearchParams } from "./types";
import fetchRegistryPageData, {
  type RegistryPageData,
  type RegistryResource,
} from "./fetchRegistryPageData";

type RegistryRow = Record<string, unknown> & { id: number | string };

interface SchemaDataGridProps<Row extends RegistryRow> {
  schema: RJSFSchema;
  initialData: RegistryPageData<Row>;
  resource: RegistryResource;
}

const formatValue = (value: unknown, schema: RJSFSchema) => {
  if (value === null || value === undefined || value === "") return "-";
  if (schema.type === "boolean") return value ? "Yes" : "No";

  if (schema.format === "date" || schema.format === "date-time") {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return schema.format === "date"
        ? date.toLocaleDateString("en-CA")
        : date.toLocaleString("en-CA");
    }
  }

  return String(value);
};

export default function SchemaDataGrid<Row extends RegistryRow>({
  schema,
  initialData,
  resource,
}: SchemaDataGridProps<Row>) {
  const columns = useMemo<GridColDef[]>(
    () =>
      Object.entries(schema.properties ?? {}).map(([field, property]) => {
        const propertySchema = property as RJSFSchema;

        return {
          field,
          headerName: propertySchema.title ?? field,
          flex: field === "name" || field === "description" ? 2 : 1,
          minWidth: field.endsWith("_id") ? 150 : 130,
          sortable: true,
          renderCell: ({ value }: GridRenderCellParams) =>
            formatValue(value, propertySchema),
        };
      }),
    [schema],
  );

  const fetchPageData = (searchParams: DashboardSearchParams) =>
    fetchRegistryPageData<Row>(resource, searchParams);

  return (
    <DataGrid
      columns={columns}
      fetchPageData={fetchPageData}
      paginationMode="server"
      initialData={initialData}
      rowSelection={false}
      noDataMessage="No records found."
    />
  );
}