import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const complianceUnitsGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("type", "Type", SearchCell),
    createColumnGroup("serialNumber", "Serial Number", SearchCell),
    createColumnGroup("vintageYear", "Vintage Year", SearchCell),
    createColumnGroup("quantityApplied", "Quantity Applied", EmptyGroupCell),
    createColumnGroup(
      "equivalentEmissionReduced",
      "Equivalent Emission Reduced",
      EmptyGroupCell,
    ),
    createColumnGroup("equivalentValue", "Equivalent Value", EmptyGroupCell),
    createColumnGroup("status", "Status", EmptyGroupCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default complianceUnitsGroupColumns;
