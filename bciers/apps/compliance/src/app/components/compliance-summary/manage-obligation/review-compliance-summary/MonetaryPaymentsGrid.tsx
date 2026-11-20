"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import monetaryPaymentsColumns from "@/compliance/src/app/components/datagrid/models/monetary-payments/monetaryPaymentsColumns";
import { PaymentData } from "@/compliance/src/app/types";
import AlertNote from "@bciers/components/form/components/AlertNote";
import SimpleAccordion from "@bciers/components/accordion/SimpleAccordion";

export const MonetaryPaymentsGrid = ({ value }: { value: PaymentData }) => {
  const payments = value;

  const columns = monetaryPaymentsColumns();

  const showAlert = payments.row_count === 0;

  return (
    <SimpleAccordion title="Monetary Payments Made">
      {showAlert && (
        <AlertNote>You have not made any monetary payment yet.</AlertNote>
      )}
      <DataGrid
        columns={columns}
        initialData={payments}
        sx={{
          "& .MuiDataGrid-virtualScroller": {
            height: "fit-content",
            minHeight: "10vh",
          },
          "& .MuiDataGrid-overlayWrapper": {
            width: "100%",
          },
          "& .MuiDataGrid-overlayWrapperInner": {
            width: "100% !important",
            // Same height MUI gives the empty grid (two rows), set in CSS rather than measured
            height:
              "var(--DataGrid-overlayHeight, calc(var(--height) * 2)) !important",
          },
        }}
      />
    </SimpleAccordion>
  );
};
