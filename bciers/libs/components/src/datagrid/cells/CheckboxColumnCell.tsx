import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import { FacilityRenderCellParams } from "@bciers/components/datagrid/cells/types";
import { Status } from "@bciers/utils/src/enums";

const CheckboxColumnCell = (params: FacilityRenderCellParams) => {
  const {
    row: { report_status, id, status },
  } = params;

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    params.api.updateRows([
      {
        ...params.row,
        report_status: event.target.checked,
      },
    ]);
  };

  return (
    <FormControl
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <Checkbox
        checked={Boolean(report_status)}
        onChange={handleCheckboxChange}
        inputProps={{ "aria-label": "Report Status" }}
      />
      <span style={{ marginLeft: 4 }}>Completed</span>
    </FormControl>
  );
};

export default CheckboxColumnCell;
