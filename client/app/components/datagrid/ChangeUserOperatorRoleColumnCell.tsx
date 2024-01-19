"use client";

import { actionHandler } from "@/app/utils/actions";
import { useState, useEffect } from "react";
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

export async function ChangeUserOperatorRoleColumnCell(
  params: DropdownItemCellParams,
) {
  const userOperatorId = params.row.id;
  const statusUpdate = params.row.status;
  const roleUpdate = params.row.userRole as UserOperatorRoles;

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

  const handleUpdateUserOperatorRole = async () => {
    console.log("in handleUpdateUserOperatorRole");
    console.log(userOperatorId, statusUpdate, roleUpdate);
    const body = JSON.stringify({
      status: statusUpdate,
      role: roleUpdate,
    });
    console.log(body);
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

  const [selectedOption, setSelectedOption] = useState(
    getDefaultValue(roleUpdate, statusUpdate),
  );
  useEffect(() => {
    handleUpdateUserOperatorRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption]);

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <Select
        label="User Role"
        value={selectedOption}
        onChange={(e: {
          target: {
            value:
              | UserOperatorRoles
              | ((prevState: UserOperatorRoles) => UserOperatorRoles);
          };
        }) => setSelectedOption(e.target.value)}
      >
        {dropdownOptions(statusUpdate).map((item, index) => (
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
