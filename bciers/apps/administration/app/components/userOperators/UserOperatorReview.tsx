"use client";

import { actionHandler } from "@bciers/actions";
import { Role, Status, UserOperatorRoles } from "@bciers/utils/src/enums";
import { UserOperatorFormData } from "./types";
import Review from "../buttons/Review";

interface Props {
  note?: string;
  userOperator: UserOperatorFormData;
  userOperatorId: string;
  showRequestChanges?: boolean;
}

export default function UserOperatorReview({
  note,
  userOperator,
  userOperatorId,
}: Props) {
  // Reusable function to change the status of the user
  const changePrimeAdminStatus = async (status: Status) => {
    const endpoint = `registration/user-operators/${userOperatorId}/status`;
    return await actionHandler(endpoint, "PATCH", endpoint, {
      body: JSON.stringify({
        role: UserOperatorRoles.ADMIN,
        status,
      }),
    });
  };

  const approvePrimeAdminRequest = async () => {
    return await changePrimeAdminStatus(Status.APPROVED);
  };

  const declinePrimeAdminRequest = async () => {
    return await changePrimeAdminStatus(Status.DECLINED);
  };

  return (
    <Review
      approvedMessage={`You have approved the administrator request.`}
      declinedMessage={`You have declined the administrator request.`}
      confirmApproveMessage={`Are you sure you want to approve the administrator request?`}
      confirmRejectMessage={`Are you sure you want to decline the administrator request?`}
      status={userOperator.status as Status}
      role={userOperator.role as Role}
      note={note}
      onApprove={approvePrimeAdminRequest}
      onReject={declinePrimeAdminRequest}
      showRequestChanges={false}
    />
  );
}
