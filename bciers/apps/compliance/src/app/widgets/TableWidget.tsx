"use client";

import { useMemo, useState } from "react";
import { WidgetProps } from "@rjsf/utils";

type CellValue = string | number | null | undefined;
type TableRow = CellValue[] | Record<string, CellValue>;

type TableWidgetOptions = {
  columnHeaders?: string[];
  tableData?: TableRow[];
  rowsPerPage?: number;
};

type TableWidgetValue = {
  columnHeaders?: string[];
  tableData?: TableRow[];
};

type TableRendererProps = {
  label?: string;
  tableOptions: TableWidgetOptions;
  valueData: TableWidgetValue;
};

const getDisplayValue = (value: CellValue): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

const normalizeRows = (headers: string[], rows: TableRow[]): string[][] => {
  return rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map((cell) => getDisplayValue(cell));
    }

    return headers.map((header) => getDisplayValue(row[header]));
  });
};

const getHeaders = (
  optionsHeaders: string[] | undefined,
  valueHeaders: string[] | undefined,
  rows: TableRow[],
): string[] => {
  if (optionsHeaders && optionsHeaders.length > 0) {
    return optionsHeaders;
  }

  if (valueHeaders && valueHeaders.length > 0) {
    return valueHeaders;
  }

  const firstRow = rows[0];
  if (firstRow && !Array.isArray(firstRow)) {
    return Object.keys(firstRow);
  }

  return [];
};

const TableRenderer = ({
  label,
  tableOptions,
  valueData,
}: TableRendererProps) => {
  const sourceRows = (tableOptions.tableData ??
    valueData.tableData ??
    []) as TableRow[];
  const headers = getHeaders(
    tableOptions.columnHeaders,
    valueData.columnHeaders,
    sourceRows,
  );
  const normalizedRows = useMemo(
    () => normalizeRows(headers, sourceRows),
    [headers, sourceRows],
  );

  const rowsPerPage = tableOptions.rowsPerPage ?? 5;
  const totalPages = Math.max(
    1,
    Math.ceil(normalizedRows.length / rowsPerPage),
  );
  const [currentPage, setCurrentPage] = useState(1);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return normalizedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [normalizedRows, rowsPerPage, safeCurrentPage]);

  return (
    <div className="w-full">
      {label ? <p className="mb-2 text-bc-bg-blue">{label}</p> : null}

      <div className="overflow-x-auto rounded border border-bc-grey-30">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bc-bg-blue text-left text-white">
              {headers.map((header) => (
                <th key={header} className="px-3 py-2 text-sm font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIndex) => (
                <tr
                  key={`${safeCurrentPage}-${rowIndex}`}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${safeCurrentPage}-${rowIndex}-${cellIndex}`}
                      className="px-3 py-2 text-sm"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="bg-white">
                <td
                  className="px-3 py-2 text-sm"
                  colSpan={Math.max(1, headers.length)}
                >
                  -
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded border border-bc-blue px-3 py-1 text-sm text-bc-links disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={safeCurrentPage === 1}
        >
          &lt;
        </button>
        <span className="text-sm text-bc-bg-blue">
          Page {safeCurrentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="rounded border border-bc-blue px-3 py-1 text-sm text-bc-links disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={safeCurrentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

const TableWidget = ({ label, options, value }: WidgetProps) => {
  const tableOptions = (options ?? {}) as TableWidgetOptions;
  const valueData = (value ?? {}) as TableWidgetValue;

  return (
    <TableRenderer
      label={label}
      tableOptions={tableOptions}
      valueData={valueData}
    />
  );
};

type TableFieldProps = {
  formData?: TableWidgetValue;
  schema?: {
    title?: string;
  };
  uiSchema?: {
    [key: string]: any;
  };
};

export const TableField = ({ formData, schema, uiSchema }: TableFieldProps) => {
  const tableOptions = (uiSchema?.["ui:options"] ?? {}) as TableWidgetOptions;
  const showLabel = uiSchema?.["ui:options"]?.label !== false;

  return (
    <TableRenderer
      label={showLabel ? schema?.title : undefined}
      tableOptions={tableOptions}
      valueData={(formData ?? {}) as TableWidgetValue}
    />
  );
};

export default TableWidget;
