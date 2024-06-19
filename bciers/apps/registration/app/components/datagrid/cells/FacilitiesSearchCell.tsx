import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";

export const FacilitySearchCell = ({
  lastFocusedField,
  setLastFocusedField,
}: {
  lastFocusedField: string | null;
  setLastFocusedField: (value: string | null) => void;
}) => {
  const RenderCell = (params: GridColumnGroupHeaderParams) => {
    const { groupId, headerName } = params;
    return (
      <HeaderSearchCell
        field={groupId ?? ""}
        fieldLabel={headerName ?? ""}
        isFocused={lastFocusedField === groupId}
        setLastFocusedField={setLastFocusedField}
      />
    );
  };
  return RenderCell;
};
