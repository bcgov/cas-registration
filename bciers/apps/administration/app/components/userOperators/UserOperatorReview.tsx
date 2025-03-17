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
  // Reusable function to change the status of the prime admin
  const changePrimeAdminStatus = async (status: Status) => {
    try {
      const response = await actionHandler(
        `registration/user-operators/${userOperatorId}/status`,
        "PATCH",
        "",
        {
          body: JSON.stringify({
            role: UserOperatorRoles.ADMIN,
            status,
          }),
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const approvePrimeAdminRequest = async () => {
    const response = await changePrimeAdminStatus(Status.APPROVED);

    return response;
  };

  const declinePrimeAdminRequest = async () => {
    const response = await changePrimeAdminStatus(Status.DECLINED);

    return response;
  };

  return (
    <Review
      approvedMessage={`You have approved the prime admin request.`}
      declinedMessage={`You have declined the prime admin request.`}
      confirmApproveMessage={`Are you sure you want to approve the prime admin request?`}
      confirmRejectMessage={`Are you sure you want to decline the prime admin request?`}
      status={userOperator.status as Status}
      role={userOperator.role as Role}
      note={note}
      onApprove={approvePrimeAdminRequest}
      onReject={declinePrimeAdminRequest}
      showRequestChanges={false}
    />
  );
}
