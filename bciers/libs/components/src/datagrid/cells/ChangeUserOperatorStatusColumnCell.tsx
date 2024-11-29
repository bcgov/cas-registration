"use client";

import Button, { ButtonOwnProps } from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { ReactNode } from "react";
import { Stack } from "@mui/system";
import { UserOperatorRoles, Status } from "@bciers/utils/src/enums";
import { UserOperatorRenderCellParams } from "@bciers/components/datagrid/cells/types";

interface UserOperatorStatusAction {
  statusTo: Status;
  title: string;
  color: ButtonOwnProps["color"];
  icon?: ReactNode;
}

const handleUpdateStatus = async (
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) => {
  return actionHandler(
    `registration/user-operators/${userOperatorId}/update-status`,
    "PUT",
    "",
    {
      body: JSON.stringify({
        role: roleUpdate,
        status: statusUpdate,
      }),
    },
  );
};

const ChangeUserOperatorStatusColumnCell = (
  params: UserOperatorRenderCellParams,
) => {
  const userOperatorStatus = params.row.status;
  const userOperatorId = params.row.id;
  const accessType = params.row.accessType;
  const userOperatorRole = accessType;
  const buttonsToShow = (status: Status): UserOperatorStatusAction[] => {
    if (status === Status.MYSELF) {
      return [];
    } else if (status === Status.PENDING) {
      return [
        {
          statusTo: Status.APPROVED,
          title: "Approve",
          color: "success",
          icon: <ThumbUpIcon />,
        },
        {
          statusTo: Status.DECLINED,
          title: "Decline",
          color: "error",
          icon: <DoNotDisturbIcon />,
        },
      ];
    } else if (status === Status.APPROVED || status === Status.DECLINED) {
      return [
        {
          statusTo: Status.PENDING,
          title: "Undo",
          color: "primary",
        },
      ];
    }
    return [];
  };

  return (
    <Stack direction="row" spacing={1}>
      {buttonsToShow(userOperatorStatus).map((item, index) => (
        <Button
          variant={item.title === "Undo" ? "text" : "outlined"}
          key={index}
          onClick={async () => {
            const res = await handleUpdateStatus(
              userOperatorId,
              item.statusTo,
              userOperatorRole as UserOperatorRoles,
            );
            params.api.updateRows([
              {
                ...params.row,
                status: res.status,
              },
            ]);
          }}
          color={item.color}
          endIcon={item.icon}
        >
          {item.title}
        </Button>
      ))}
    </Stack>
  );
};

export default ChangeUserOperatorStatusColumnCell;
