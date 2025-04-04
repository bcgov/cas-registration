"use client";

import Button from "@mui/material/Button";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Stack } from "@mui/system";
import { InternalFrontEndRoles, Status } from "@bciers/utils/src/enums";
import { useState } from "react";
import SnackBar from "@bciers/components/form/components/SnackBar";
import LoadingSpinner from "@bciers/components/loading/LoadingSpinner";
import { BC_GOV_COMPONENTS_GREY } from "@bciers/styles";
import { InternalAccessRequestGridRenderCellParams } from "../types";
import { useSession } from "next-auth/react";
import handleInternalAccessRequest from "@bciers/actions/api/handleInternalAccessRequest";

export const formatRole = (role: InternalFrontEndRoles) => {
  // this function transforms internal role names (which are prefixed with "cas_") into the format we want to display in the grid (no prefix, capitalized)
  return role
    .split("_")
    .slice(1)
    .join(" ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());
};

// We don't have a status field on the user model, so we infer it from the role
const roleStatusMap = new Map<InternalFrontEndRoles, Status>([
  [InternalFrontEndRoles.CAS_ADMIN, Status.APPROVED],
  [InternalFrontEndRoles.CAS_ANALYST, Status.APPROVED],
  [InternalFrontEndRoles.CAS_DIRECTOR, Status.APPROVED],
  [InternalFrontEndRoles.CAS_VIEW_ONLY, Status.APPROVED],
  [InternalFrontEndRoles.CAS_PENDING, Status.PENDING],
]);

export const inferStatus = (
  role: InternalFrontEndRoles,
  archivedAt: string | undefined,
): Status | undefined => {
  if (archivedAt) return Status.DECLINED;
  return roleStatusMap.get(role);
};

const ActionColumnCell = (
  params: InternalAccessRequestGridRenderCellParams,
) => {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id, role, archived_at: archivedAt } = params.row;
  const [status, setStatus] = useState(
    params?.row.status || inferStatus(role, archivedAt),
  );

  const [isDeclined, setIsDeclined] = useState(Boolean(archivedAt));

  enum Actions {
    EDIT = "Edit",
    APPROVE = "Approve",
    DECLINE = "Decline",
  }

  const handleButtonClick = async (action: Actions) => {
    setIsLoading(true);

    const res = await handleInternalAccessRequest(
      id,
      // if we're editing or declining, we set the role to pending
      action !== Actions.APPROVE ? InternalFrontEndRoles.CAS_PENDING : role,
      action === Actions.DECLINE,
    );

    if (res?.error) {
      throw new Error(`Failed to update user`);
    }

    const newStatus = inferStatus(res.app_role, res.archived_at);
    const newRole = res.app_role;

    setSnackbarMessage(
      `${res.first_name} ${res.last_name} is now ${
        res.archived_at ? "declined" : formatRole(newRole)
      }`,
    );
    setIsSnackbarOpen(true);

    params.api.updateRows([
      {
        ...params.row,
        status: res.archived_at ? Status.DECLINED : newStatus,
        role: newRole,
      },
    ]);
    setIsDeclined(res.archived_at);
    setStatus(newStatus);
    setIsLoading(false);
  };

  const editButton = (
    <Button
      variant="outlined"
      onClick={() => handleButtonClick(Actions.EDIT)}
      color={"primary"}
      endIcon={
        isLoading ? (
          <LoadingSpinner color={BC_GOV_COMPONENTS_GREY} />
        ) : undefined
      }
      disabled={isLoading}
    >
      Edit
    </Button>
  );
  const approveDeclineButton = (
    <>
      <Button
        variant="outlined"
        onClick={() => handleButtonClick(Actions.APPROVE)}
        color={"success"}
        endIcon={
          isLoading ? (
            <LoadingSpinner color={BC_GOV_COMPONENTS_GREY} />
          ) : (
            <ThumbUpIcon />
          )
        }
        disabled={isLoading}
      >
        Approve
      </Button>

      <Button
        variant="outlined"
        onClick={() => handleButtonClick(Actions.DECLINE)}
        color={"error"}
        endIcon={
          isLoading ? (
            <LoadingSpinner color={BC_GOV_COMPONENTS_GREY} />
          ) : (
            <DoNotDisturbIcon />
          )
        }
        disabled={isLoading || isDeclined}
      >
        Decline
      </Button>
    </>
  );

  return (
    <>
      <Stack direction="row" spacing={1}>
        {email !== params?.row.email &&
          (status === Status.PENDING ? approveDeclineButton : editButton)}
      </Stack>
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message={snackbarMessage}
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default ActionColumnCell;
