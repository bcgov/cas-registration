"use client";

import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import Button, { ButtonOwnProps } from "@mui/material/Button";
import { actionHandler } from "@/app/utils/actions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { ReactNode } from "react";
import { Stack } from "@mui/system";
import { Status } from "@/app/types/types";

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
  };
}

const handleUpdateStatus = async (
  userOperatorId: string,
  statusUpdate: Status,
) => {
  try {
    return await actionHandler(
      `registration/select-operator/user-operator/${userOperatorId}/update-status`,
      "PUT",
      "/dashboard/users",
      {
        body: JSON.stringify({
          status: statusUpdate,
        }),
      },
    );
  } catch (error) {
    throw error;
  }
};

export async function ChangeUserOperatorStatusColumnCell(
  params: ButtonRenderCellParams,
) {
  const userOperatorStatus = params.row.status;
  const userOperatorId = params.row.id;

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
          statusTo: Status.REJECTED,
          title: "Deny",
          color: "error",
          icon: <DoNotDisturbIcon />,
        },
      ];
    } else if (status === Status.APPROVED || status === Status.REJECTED) {
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
