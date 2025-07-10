"use client";

import { useState, useMemo } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import monetaryPaymentsColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsColumns";
import monetaryPaymentsGroupColumns from "@/compliance/src/app/components/datagrid/models/manetary-payments/monetaryPaymentsGroupColumns";
import { PaymentData } from "@/compliance/src/app/types";
import AlertNote from "@bciers/components/form/components/AlertNote";
import SimpleAccordion from "@bciers/components/accordion/SimpleAccordion";

interface MonetaryPaymentsProps {
  gridData: PaymentData;
}

export const MonetaryPaymentsGrid = ({
  value,
}: {
  value: MonetaryPaymentsProps;
}) => {
  const { gridData } = value;
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

  const showAlert = gridData.rows.length === 0;

  return (
    <SimpleAccordion title="Monetary Payments Made">
      {showAlert && (
        <AlertNote>You have not made any monetary payment yet.</AlertNote>
      )}
      <DataGrid
        columns={columns}
        initialData={gridData}
        columnGroupModel={columnGroup}
      />
    </SimpleAccordion>
  );
};
