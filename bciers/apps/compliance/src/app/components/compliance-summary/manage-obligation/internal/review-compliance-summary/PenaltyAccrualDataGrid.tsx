"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import penaltyAccrualColumns from "@/compliance/src/app/components/datagrid/models/penalty-accrual/penaltyAccrualColumns";
import { PenaltyAccrualFieldData } from "./types";

type PenaltyAccrualDataGridFieldProps = {
  formData?: PenaltyAccrualFieldData;
  label?: string;
  uiSchema?: {
    [key: string]: any;
  };
};

export const PenaltyAccrualDataGrid = ({
  formData,
  label,
  uiSchema,
}: PenaltyAccrualDataGridFieldProps) => {
  const showLabel = uiSchema?.["ui:options"]?.label !== false;

  // No natural id, but the list is ordered and read-only, so the index is stable
  const rows = (formData?.rows ?? []).map((accrual, index) => ({
    ...accrual,
    id: index,
  }));

  return (
    <div className="w-full">
      {showLabel ? (
        <p className="mb-2 text-bc-bg-blue">{label ?? "Accrual data"}</p>
      ) : null}
      <DataGrid
        key={formData?.query_id}
        columns={penaltyAccrualColumns()}
        initialData={{ rows, row_count: rows.length }}
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
