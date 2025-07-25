"use client";

import { useState, useMemo } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import monetaryPaymentsColumns from "@/compliance/src/app/components/datagrid/models/monetary-payments/monetaryPaymentsColumns";
import monetaryPaymentsGroupColumns from "@/compliance/src/app/components/datagrid/models/monetary-payments/monetaryPaymentsGroupColumns";
import { PaymentData } from "@/compliance/src/app/types";
import AlertNote from "@bciers/components/form/components/AlertNote";
import SimpleAccordion from "@bciers/components/accordion/SimpleAccordion";

export const MonetaryPaymentsGrid = ({ value }: { value: PaymentData }) => {
  const payments = value;
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

  const showAlert = payments.row_count === 0;
  console.log("payments:", payments);

  return (
    <SimpleAccordion title="Monetary Payments Made">
      {showAlert && (
        <AlertNote>You have not made any monetary payment yet.</AlertNote>
      )}
      <DataGrid
        columns={columns}
        initialData={payments}
        columnGroupModel={columnGroup}
      />
    </SimpleAccordion>
  );
};
