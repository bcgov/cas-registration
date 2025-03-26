"use client";
import { useState, useMemo } from "react";
import { TitleRow } from "./TitleRow";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import monetaryPaymentsColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsColumns";
import monetaryPaymentsGroupColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsGroupColumns";
import { MonetaryPaymentsAlertNote } from "@/compliance/src/app/components/compliance-summary/compliance-summary-review/MonetaryPaymentsAlertNote";

export const MonetaryPaymentsGrid = ({ data }: any) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  // Get the columns from the columns file
  const columns = monetaryPaymentsColumns();

  // Get the column groups from the column groups file
  const columnGroup = useMemo(
    () => monetaryPaymentsGroupColumns(SearchCell),
    [SearchCell],
  );

  // Sample initial data (empty for now)
  const initialData = {
    rows: [
      {
        id: 1,
        paymentReceivedDate: "-",
        paymentAmountApplied: "-",
        paymentMethod: "-",
        transactionType: "-",
        referenceNumber: "-",
      },
    ],
    row_count: 1, // The total number of rows (should match rows.length)
  };

  const gridData = data == "" ? initialData : data;

  return (
    <div style={{ width: "100%", marginBottom: "50px" }}>
      <TitleRow label="Monetary Payments Made" />
      <MonetaryPaymentsAlertNote />

      <DataGrid
        columns={columns}
        initialData={gridData}
        columnGroupModel={columnGroup}
        hideFooter={true}
        sx={{
          "& .MuiDataGrid-virtualScroller, & .mui-qvtrhg-MuiDataGrid-virtualScroller":
            {
              minHeight: "auto",
            },
        }}
      />
    </div>
  );
};
