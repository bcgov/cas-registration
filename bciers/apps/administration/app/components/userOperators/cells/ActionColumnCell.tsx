"use client";

import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Stack } from "@mui/system";
import { UserOperatorRoles, Status } from "@bciers/utils/enums";
import {
  UserOperatorGridRenderCellParams,
  UserOperatorStatusAction,
} from "@/administration/app/components/userOperators/types";
import { useCallback } from "react";

const handleUpdateStatus = async (
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) => {
  try {
    return await actionHandler(
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
  } catch (error) {
    throw error;
  }
};

const ActionColumnCell = (params: UserOperatorGridRenderCellParams) => {
  const userOperatorStatus = params.row.status;
  const userOperatorId = params.row.id;
  const userOperatorRole = params.row.userRole;
  const buttonsToShow = useCallback(
    (status: string): UserOperatorStatusAction[] => {
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
    },
    [],
  );

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

export default ActionColumnCell;
