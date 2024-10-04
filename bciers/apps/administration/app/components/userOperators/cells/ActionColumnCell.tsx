"use client";

import Button from "@mui/material/Button";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Stack } from "@mui/system";
import { UserOperatorRoles, Status } from "@bciers/utils/enums";
import {
  AccessRequestGridRenderCellParams,
  AccessRequestStatusAction,
} from "@/administration/app/components/userOperators/types";
import { useCallback } from "react";
import handleAccessRequestStatus from "./handleAccessRequestStatus";

const ActionColumnCell = (params: AccessRequestGridRenderCellParams) => {
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
              title: "Undo",
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
  );
};

export default ActionColumnCell;
