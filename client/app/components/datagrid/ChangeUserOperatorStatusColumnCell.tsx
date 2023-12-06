"use client";

import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import Button from "@mui/material/Button";
import { actionHandler } from "@/app/utils/actions";

type UserOperatorStatus = "draft" | "pending" | "approved" | "rejected";

interface UserOperatorStatusAction {
  statusTo: UserOperatorStatus;
  title: string;
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
    if (status.toLowerCase() === "pending") {
      return [
        { statusTo: "approved", title: "Approve" },
        { statusTo: "rejected", title: "Deny" },
      ];
    } else if (
      status.toLowerCase() === "approved" ||
      status.toLowerCase() === "rejected"
    ) {
      return [{ statusTo: "pending", title: "Undo" }];
    }
    return [];
  };

  return (
    <>
      {buttonsToShow(userOperatorStatus).map((item, index) => (
        <Button
          variant="outlined"
          key={index}
          onClick={async () =>
            handleUpdateStatus(userOperatorId, item.statusTo)
          }
        >
          {item.title}
        </Button>
      ))}
    </>
  );
}
