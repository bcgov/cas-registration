"use client";

import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import Button, { ButtonOwnProps } from "@mui/material/Button";
import { actionHandler } from "@/app/utils/actions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { ReactNode } from "react";
import { Stack } from "@mui/system";

type UserOperatorStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "myself";

interface UserOperatorStatusAction {
  statusTo: UserOperatorStatus;
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
    status: UserOperatorStatus;
    actions: string;
  };
}

const handleUpdateStatus = async (
  userOperatorId: string,
  statusUpdate: UserOperatorStatus,
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

  const buttonsToShow = (
    status: UserOperatorStatus,
  ): UserOperatorStatusAction[] => {
    if (status.toLowerCase() === "myself") {
      return [];
    } else if (status.toLowerCase() === "pending") {
      return [
        {
          statusTo: "approved",
          title: "Approve",
          color: "success",
          icon: <ThumbUpIcon />,
        },
        {
          statusTo: "rejected",
          title: "Deny",
          color: "error",
          icon: <DoNotDisturbIcon />,
        },
      ];
    } else if (
      status.toLowerCase() === "approved" ||
      status.toLowerCase() === "rejected"
    ) {
      return [
        {
          statusTo: "pending",
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
