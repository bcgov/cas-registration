"use client";

import Button from "@mui/material/Button";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Stack } from "@mui/system";
import { UserOperatorRoles, Status } from "@bciers/utils/src/enums";
import {
  AccessRequestGridRenderCellParams,
  AccessRequestStatusAction,
} from "@/administration/app/components/userOperators/types";
import { useCallback, useState } from "react";
import handleAccessRequestStatus from "./handleAccessRequestStatus";
import SnackBar from "@bciers/components/form/components/SnackBar";

const ActionColumnCell = (params: AccessRequestGridRenderCellParams) => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {
    status: userOperatorStatus,
    id: userOperatorId,
    userRole: userOperatorRole,
  } = params.row;
  const buttonsToShow = useCallback(
    (status: string): AccessRequestStatusAction[] => {
      switch (status) {
        case Status.MYSELF:
          return [];
        case Status.PENDING:
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
        case Status.APPROVED:
        case Status.DECLINED:
          return [
            {
              statusTo: Status.PENDING,
              title: "Edit",
              color: "primary",
            },
          ];
        default:
          return [];
      }
    },
    [],
  );

  return (
    <>
      <Stack direction="row" spacing={1}>
        {buttonsToShow(userOperatorStatus).map((item, index) => (
          <Button
            variant={item.title === "Undo" ? "text" : "outlined"}
            key={index}
            onClick={async () => {
              const res = await handleAccessRequestStatus(
                userOperatorId,
                item.statusTo,
                userOperatorRole as UserOperatorRoles,
              );
              if (!res?.error) {
                setSnackbarMessage(
                  `${res.first_name} ${
                    res.last_name
                  } is now ${res.status.toLowerCase()}`,
                );
                setIsSnackbarOpen(true);
              }
              params.api.updateRows([
                {
                  ...params.row,
                  // If the user is pending, we want to default the access type dropdown to Reporter
                  userRole:
                    item.statusTo === Status.PENDING
                      ? "reporter"
                      : userOperatorRole,
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
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message={snackbarMessage}
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default ActionColumnCell;
