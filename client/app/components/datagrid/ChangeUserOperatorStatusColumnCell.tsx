"use client";

import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import Button, { ButtonOwnProps } from "@mui/material/Button";
import { actionHandler } from "@/app/utils/actions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { ReactNode } from "react";
import { Stack } from "@mui/system";
import { Status } from "@/app/utils/enums";

interface UserOperatorStatusAction {
  statusTo: Status;
  title: string;
  color: ButtonOwnProps["color"];
  icon?: ReactNode;
}

interface ButtonRenderCellParams extends GridRenderCellParams {
  row: {
    id: string;
    name: string;
    email: string;
    business: string;
    userRole: string;
    status: Status;
    actions: string;
    userOperatorId: number;
  };
}

const handleUpdateStatus = async (
  userOperatorId: number,
  statusUpdate: Status,
) => {
  try {
    return await actionHandler(
      `registration/select-operator/user-operator/update-status`,
      "PUT",
      "/dashboard/users",
      {
        body: JSON.stringify({
          status: statusUpdate,
          user_operator_id: userOperatorId,
        }),
      },
    );
  } catch (error) {
    throw error;
  }
};

export async function ChangeUserOperatorStatusColumnCell(
  params: Readonly<ButtonRenderCellParams>,
) {
  const userOperatorStatus = params.row.status;
  const userOperatorId = params.row.userOperatorId;

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
          onClick={async () =>
            handleUpdateStatus(userOperatorId, item.statusTo)
          }
          color={item.color}
          endIcon={item.icon}
        >
          {item.title}
        </Button>
      ))}
    </Stack>
  );
}
