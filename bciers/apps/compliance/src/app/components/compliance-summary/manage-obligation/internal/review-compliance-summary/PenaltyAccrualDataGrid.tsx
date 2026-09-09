"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import penaltyAccrualColumns from "@/compliance/src/app/components/datagrid/models/penalty-accrual/penaltyAccrualColumns";

type PenaltyAccrualCell = string | number | null | undefined;

type PenaltyAccrualDataGridValue =
  | {
      tableData?: Array<PenaltyAccrualCell[]>;
      accrual_data?: Array<PenaltyAccrualCell[]>;
      daily_accumulated_list?: Array<
        | PenaltyAccrualCell[]
        | {
            date?: PenaltyAccrualCell;
            daily_penalty?: PenaltyAccrualCell;
            daily_compounded?: PenaltyAccrualCell;
            accumulated_penalty?: PenaltyAccrualCell;
            accumulated_compounded?: PenaltyAccrualCell;
            interest_rate?: PenaltyAccrualCell;
          }
      >;
    }
  | Array<PenaltyAccrualCell[]>
  | undefined;

type PenaltyAccrualRow = {
  id: string;
  date: string;
  daily_penalty: string;
  daily_compounded: string;
  accumulated_penalty: string;
  accumulated_compounded: string;
  interest_rate: string;
};

type PenaltyAccrualDataGridFieldProps = {
  formData?: PenaltyAccrualDataGridValue;
  label?: string;
  uiSchema?: {
    [key: string]: any;
  };
};

const getDisplayValue = (value: PenaltyAccrualCell): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const toPenaltyAccrualRow = (
  row: PenaltyAccrualCell[] | Record<string, PenaltyAccrualCell>,
  index: number,
): PenaltyAccrualRow => {
  const rowValues = Array.isArray(row)
    ? row
    : [
        row?.date,
        row?.daily_penalty,
        row?.daily_compounded,
        row?.accumulated_penalty,
        row?.accumulated_compounded,
        row?.interest_rate,
      ];

  return {
    id: `penalty-accrual-${index}`,
    date: getDisplayValue(rowValues[0]),
    daily_penalty: getDisplayValue(rowValues[1]),
    daily_compounded: getDisplayValue(rowValues[2]),
    accumulated_penalty: getDisplayValue(rowValues[3]),
    accumulated_compounded: getDisplayValue(rowValues[4]),
    interest_rate: getDisplayValue(rowValues[5]),
  };
};

const normalizeAccrualRows = (
  formData: PenaltyAccrualDataGridValue,
): Array<PenaltyAccrualCell[] | Record<string, PenaltyAccrualCell>> => {
  if (Array.isArray(formData)) {
    return formData;
  }

  if (!formData || typeof formData !== "object") {
    return [];
  }

  const tableData = Array.isArray(formData.tableData)
    ? formData.tableData
    : Array.isArray(formData.accrual_data)
      ? formData.accrual_data
      : Array.isArray(formData.daily_accumulated_list)
        ? formData.daily_accumulated_list
        : [];

  return tableData;
};

export const PenaltyAccrualDataGrid = ({
  formData,
  label,
  uiSchema,
}: PenaltyAccrualDataGridFieldProps) => {
  const rawRows = normalizeAccrualRows(formData);
  const rows = rawRows.map(toPenaltyAccrualRow);
  const rowsPerPage = Number(uiSchema?.["ui:options"]?.rowsPerPage ?? 10);
  const showLabel = uiSchema?.["ui:options"]?.label !== false;

  return (
    <div className="w-full">
      {showLabel ? (
        <p className="mb-2 text-bc-bg-blue">{label ?? "Accrual data"}</p>
      ) : null}
      <DataGrid
        columns={penaltyAccrualColumns()}
        initialData={{ rows, row_count: rows.length }}
        pageSize={rowsPerPage}
        sx={{
          "& .MuiDataGrid-virtualScroller": {
            height: "fit-content",
            minHeight: "10vh",
          },
        }}
      />
    </div>
  );
};

export default PenaltyAccrualDataGrid;
