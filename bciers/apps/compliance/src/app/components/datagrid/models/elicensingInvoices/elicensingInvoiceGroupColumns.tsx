import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

/**
 * Column groups for eLicensing Invoice table.
 *
 * @param SearchCell - component for interactive group headers (search-enabled)
 * @param isInternalUser - determines whether "Operator Name" is shown
 */
const elicensingInvoiceGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
  isInternalUser: boolean,
): GridColumnGroupingModel => {
  const groups: GridColumnGroupingModel = [
    createColumnGroup("compliance_period", "Compliance Period", SearchCell),

    // operator_legal_name inserted conditionally

    createColumnGroup("operation_name", "Operation Name", SearchCell),
    createColumnGroup("invoice_type", "Invoice Type", SearchCell),
    createColumnGroup("invoice_number", "Invoice Number", SearchCell),

    createColumnGroup("invoice_total", "Invoice Total", EmptyGroupCell),
    createColumnGroup("total_adjustments", "Total Adjustments", EmptyGroupCell),
    createColumnGroup("total_payments", "Total Payments", EmptyGroupCell),
    createColumnGroup(
      "outstanding_balance",
      "Outstanding Balance",
      EmptyGroupCell,
    ),
  ];

  if (isInternalUser) {
    // Insert Operator Name after Compliance Period (index 1)
    groups.splice(
      1,
      0,
      createColumnGroup("operator_legal_name", "Operator Name", SearchCell),
    );
  }

  return groups;
};

export default elicensingInvoiceGroupColumns;
