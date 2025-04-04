import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { formatRole, inferStatus } from "./ActionColumnCell";
import { InternalAccessRequestGridRenderCellParams } from "../types";
import { Status } from "@bciers/utils/src/enums";

const InternalUserRoleColumnCell = (
  params: InternalAccessRequestGridRenderCellParams,
) => {
  const {
    row: { role, id, archived_at: archivedAt },
  } = params;

  const status = params?.row.status || inferStatus(role, archivedAt);

  const handleChange = (event: SelectChangeEvent) => {
    params.api.updateRows([
      {
        ...params.row,
        role: event.target.value,
        status: Status.PENDING,
      },
    ]);
  };

  if (status !== Status.PENDING) return <span>{formatRole(role)}</span>;

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
        value={role}
        label="User Role"
        onChange={handleChange}
        inputProps={{
          "aria-label": "User Role",
        }}
      >
        <MenuItem value="cas_admin">Admin</MenuItem>
        <MenuItem value="cas_analyst">Analyst</MenuItem>
        <MenuItem value="cas_director">Director</MenuItem>
        <MenuItem value="cas_view_only">View-only</MenuItem>
        <MenuItem value="cas_pending" className="hidden"></MenuItem>
      </Select>
    </FormControl>
  );
};

export default InternalUserRoleColumnCell;
