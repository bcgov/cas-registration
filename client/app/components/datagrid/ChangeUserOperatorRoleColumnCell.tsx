"use client";

import { actionHandler } from "@/app/utils/actions";
import FormControl from "@mui/material/FormControl";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Status, UserOperatorRoles } from "@/app/utils/enums";

interface UserOperatorRoleAction {
  title: string;
  value: UserOperatorRoles;
  disabled?: boolean;
}

interface DropdownItemCellParams extends GridRenderCellParams {
  row: {
    id: string;
    userRole: UserOperatorRoles;
    status: Status;
  };
}

const getDefaultValue = (
  currentRole: UserOperatorRoles,
  currentStatus: Status,
): UserOperatorRoles => {
  if (currentStatus === Status.REJECTED) {
    return UserOperatorRoles.N_A;
  }
  return currentRole;
};

const handleUpdateUserOperatorRole = async (
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) => {
  try {
    return await actionHandler(
      `registration/select-operator/user-operator/${userOperatorId}`,
      "PUT",
      "/dashboard/users",
      {
        body: JSON.stringify({
          status: statusUpdate,
          role: roleUpdate,
        }),
      },
    );
  } catch (error) {
    throw error;
  }
};

export async function ChangeUserOperatorRoleColumnCell(
  params: DropdownItemCellParams,
) {
  const userOperatorId = params.row.id;
  const userOperatorStatus = params.row.status;
  const userOperatorRole = params.row.userRole as UserOperatorRoles;

  const dropdownOptions = (status: Status): UserOperatorRoleAction[] => {
    // if status === MYSELF, role will be "Admin"
    if (status === Status.MYSELF) {
      return [
        {
          title: "Admin",
          value: UserOperatorRoles.ADMIN,
          disabled: true,
        },
      ];
    } else if (status === Status.PENDING || status === Status.APPROVED) {
      return [
        {
          title: "Admin",
          value: UserOperatorRoles.ADMIN,
        },
        {
          title: "Reporter",
          value: UserOperatorRoles.REPORTER,
        },
      ];
    } else if (status === Status.REJECTED) {
      return [
        {
          title: UserOperatorRoles.N_A,
          value: UserOperatorRoles.N_A,
          disabled: true,
        },
      ];
    }
    return [];
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <Select
        label="User Role"
        value={getDefaultValue(userOperatorRole, userOperatorStatus)}
        onChange={async () =>
          handleUpdateUserOperatorRole(
            userOperatorId,
            userOperatorStatus,
            userOperatorRole,
          )
        }
      >
        {dropdownOptions(userOperatorStatus).map((item, index) => (
          <MenuItem
            key={index}
            value={item.value}
            sx={{ minWidth: 100 }}
            disabled={item.disabled}
          >
            {item.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
