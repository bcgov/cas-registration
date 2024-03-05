import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { UserOperatorRenderCellParams } from "@/app/components/datagrid/cells/types";
import { Status } from "@/app/utils/enums";

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
        value={accessType}
        label="Access Type"
        onChange={handleChange}
      >
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="reporter">Reporter</MenuItem>
      </Select>
    </FormControl>
  );
};

export default AccessTypeColumnCell;
