"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import penaltyAccrualColumns from "@/compliance/src/app/components/datagrid/models/penalty-accrual/penaltyAccrualColumns";

type PenaltyAccrualCell = string | number | null | undefined;

type PenaltyAccrualDataGridValue = {
  tableData?: Array<PenaltyAccrualCell[]>;
};

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
  row: PenaltyAccrualCell[],
  index: number,
): PenaltyAccrualRow => {
  return {
    id: `penalty-accrual-${index}`,
    date: getDisplayValue(row[0]),
    daily_penalty: getDisplayValue(row[1]),
    daily_compounded: getDisplayValue(row[2]),
    accumulated_penalty: getDisplayValue(row[3]),
    accumulated_compounded: getDisplayValue(row[4]),
    interest_rate: getDisplayValue(row[5]),
  };
};

export const PenaltyAccrualDataGrid = ({
  formData,
  label,
  uiSchema,
}: PenaltyAccrualDataGridFieldProps) => {
  const rows = (formData?.tableData ?? []).map(toPenaltyAccrualRow);
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
