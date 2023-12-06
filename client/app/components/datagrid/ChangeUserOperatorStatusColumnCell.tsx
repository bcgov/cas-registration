"use client";

import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import Button from "@mui/material/Button";
type UserOperatorStatus = "draft" | "pending" | "approved" | "rejected";

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

export async function ChangeUserOperatorStatusColumnCell(
  params: ButtonRenderCellParams,
) {
  const userOperatorStatus = params.row.status;

  const buttonsToShow = (status: UserOperatorStatus): string[] => {
    if (status.toLowerCase() === "pending") {
      return ["Approve", "Deny"];
    } else if (
      status.toLowerCase() === "approved" ||
      status.toLowerCase() === "rejected"
    ) {
      return ["Undo"];
    }
    return [];
  };

  return (
    <>
      {buttonsToShow(userOperatorStatus).map((item, index) => (
        <Button variant="outlined" key={index}>
          {item}
        </Button>
      ))}
    </>
  );
}
