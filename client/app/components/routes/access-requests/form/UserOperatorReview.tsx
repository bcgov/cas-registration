"use client";

import { actionHandler } from "@/app/utils/actions";
import Review from "app/components/button/Review";
import { Status } from "@/app/types/types";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface Props {
  // TODO: fix schema of userOperator data
  userOperator: Partial<UserOperatorFormData>;
  userOperatorId: number;
}

export default function UserOperatorReview({
  userOperator,
  userOperatorId,
}: Props) {
  async function approveRequest() {
    userOperator.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/user-operators/${userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${userOperatorId}`,
      {
        body: JSON.stringify(userOperator),
      },
    );
    return response;
  }

  async function rejectRequest() {
    userOperator.status = Status.REJECTED;
    const response = await actionHandler(
      `registration/user-operators/${userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${userOperatorId}`,
      {
        body: JSON.stringify(userOperator),
      },
    );
    return response;
  }
  return (
    <Review
      approvedMessage="You have approved the request for prime admin access."
      rejectedMessage="You have rejected the request for prime admin access."
      confirmApproveMessage="Are you sure you want to approve this request for prime admin access?"
      confirmRejectMessage="Are you sure you want to reject this request for prime admin access?"
      isStatusPending={userOperator.user_operator_status === Status.PENDING}
      onApprove={approveRequest}
      onReject={rejectRequest}
    />
  );
}
