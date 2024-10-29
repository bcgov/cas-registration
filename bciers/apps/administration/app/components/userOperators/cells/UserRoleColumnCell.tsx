import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { UserOperatorRoles, Status } from "@bciers/utils/src/enums";
import { AccessRequestGridRenderCellParams } from "@/administration/app/components/userOperators/types";

const UserRoleColumnCell = (params: AccessRequestGridRenderCellParams) => {
  const {
    row: { userRole, id, status },
  } = params;

  const handleChange = (event: SelectChangeEvent) => {
    params.api.updateRows([
      {
        ...params.row,
        userRole: event.target.value,
      },
    ]);
  };

  if (status === Status.DECLINED) return "N/A";

  if (status === Status.APPROVED || status === Status.MYSELF)
    return <span className="capitalize">{userRole}</span>;

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
        value={userRole as UserOperatorRoles}
        label="User Role"
        onChange={handleChange}
        inputProps={{
          "aria-label": "User Role",
        }}
      >
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="reporter">Reporter</MenuItem>
      </Select>
    </FormControl>
  );
};

export default UserRoleColumnCell;
