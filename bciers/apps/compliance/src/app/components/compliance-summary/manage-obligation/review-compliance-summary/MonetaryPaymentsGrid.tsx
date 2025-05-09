"use client";
import { useState, useMemo } from "react";
import { TitleRow } from "../../TitleRow";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import monetaryPaymentsColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsColumns";
import monetaryPaymentsGroupColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsGroupColumns";
import { MonetaryPaymentsAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsAlertNote";
import { PaymentsData } from "@/compliance/src/app/types/payments";
interface MonetaryPaymentsGridProps {
  data?: PaymentsData;
}

export const MonetaryPaymentsGrid = ({ data }: MonetaryPaymentsGridProps) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = monetaryPaymentsColumns();

  const columnGroup = useMemo(
    () => monetaryPaymentsGroupColumns(SearchCell),
    [SearchCell],
  );

  const initialData: PaymentsData = {
    rows: [
      {
        id: 1,
        paymentReceivedDate: "-",
        paymentAmountApplied: 0,
        paymentMethod: "-",
        transactionType: "-",
        receiptNumber: "-",
      },
    ],
    row_count: 1,
  };

  const gridData = data ?? initialData;
  const showAlert = !data || data.rows.length === 0;

  return (
    <div style={{ width: "100%", marginBottom: "50px" }}>
      <TitleRow label="Monetary Payments Made" />
      {showAlert && <MonetaryPaymentsAlertNote />}

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
