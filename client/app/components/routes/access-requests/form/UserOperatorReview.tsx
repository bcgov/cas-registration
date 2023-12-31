"use client";

import { actionHandler } from "@/app/utils/actions";
import Review from "app/components/button/Review";
import { Status } from "@/app/utils/enums";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface Props {
  userOperator: UserOperatorFormData;
  userOperatorId: number;
}

export default function UserOperatorReview({
  userOperator,
  userOperatorId,
}: Props) {
  async function approveRequest() {
    userOperator.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/select-operator/user-operator/operator/${userOperatorId}/update-status`,
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
      `registration/select-operator/user-operator/operator/${userOperatorId}/update-status`,
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
      isStatusPending={userOperator.status === Status.PENDING}
      onApprove={approveRequest}
      onReject={rejectRequest}
    />
  );
}
