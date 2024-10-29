import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { UserOperatorRenderCellParams } from "@bciers/components/datagrid/cells/types";
import { UserOperatorRoles, Status } from "@bciers/utils/src/enums";

const AccessTypeColumnCell = (params: UserOperatorRenderCellParams) => {
  const {
    row: { accessType, id, status },
  } = params;

  const handleChange = (event: SelectChangeEvent) => {
    params.api.updateRows([
      {
        ...params.row,
        accessType: event.target.value,
      },
    ]);
  };

  if (status === Status.DECLINED) {
    return "N/A";
  }

  if (status === Status.APPROVED || status === Status.MYSELF) {
    return <span className="capitalize">{accessType}</span>;
  }

  return (
    <FormControl
      style={{
        minWidth: 120,
      }}
    >
      <Select
        labelId={id}
        id={id}
        name={id}
        notched={false}
        value={accessType as UserOperatorRoles}
        label="Access Type"
        onChange={handleChange}
        inputProps={{
          "aria-label": "Access Type",
        }}
      >
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="reporter">Reporter</MenuItem>
      </Select>
    </FormControl>
  );
};

export default AccessTypeColumnCell;
