import { GridColDef } from "@mui/x-data-grid";
import { ApplyComplianceUnitCell } from "@/compliance/src/app/components/datagrid/cells/ApplyComplianceUnitCell";
import { BccrUnit } from "@/compliance/src/app/types";

const applyComplianceUnitsColumns = (
  charge_rate: number,
  readonly?: boolean,
  onUpdate?: (unit: BccrUnit) => void,
): GridColDef[] => {
  return [
    {
      field: "type",
      headerName: "Type",
      width: 90,
      type: "string",
    },
    {
      field: "serial_number",
      headerName: "Serial Number",
      type: "string",
      flex: 1,
      cellClassName: "text-left break-all",
    },
    {
      field: "vintage_year",
      headerName: "Vintage Year",
      width: 100,
      type: "string",
    },
    {
      field: "quantity_available",
      headerName: "Quantity Available",
      width: 120,
      type: "string",
      valueFormatter: (value) => `${Number(value).toFixed(0)}`,
      sortComparator: (a, b) => a - b,
    },
    {
      field: "quantity_to_be_applied",
      headerName: "Quantity to be Applied",
      width: 150,
      type: "number",
      sortable: false,
      renderCell: (params) => (
        <ApplyComplianceUnitCell
          {...params}
          readonly={readonly}
          onUpdate={(value) => {
            const updatedUnit = {
              ...params.row,
              quantity_to_be_applied: value,
            };
            onUpdate?.(updatedUnit);
          }}
        />
      ),
    },
    {
      field: "equivalent_emission_reduced",
      headerName: "Equivalent Emission Reduced",
      width: 150,
      type: "string",
      valueGetter: (_value, row) => {
        return !row.quantity_to_be_applied
          ? 0
          : Number(row.quantity_to_be_applied);
      },
      valueFormatter: (value) => `${value} tCO2e`,
      sortComparator: (a, b) => a - b,
    },
    {
      field: "equivalent_value",
      headerName: "Equivalent Value",
      width: 150,
      type: "string",
      valueGetter: (_value, row) => {
        if (!row.quantity_to_be_applied) return 0;
        const value = Number(row.quantity_to_be_applied);
        return value === 0 ? 0 : value * charge_rate;
      },
      valueFormatter: (value) =>
        `$${Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
  ];
};

export default applyComplianceUnitsColumns;
