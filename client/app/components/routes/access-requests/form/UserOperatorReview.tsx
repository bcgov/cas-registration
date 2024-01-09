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
  const changeStatus = async (
    status: Status,
    userOperatorData: UserOperatorFormData,
    id: number,
  ) => {
    userOperatorData.status = status;
    const response = await actionHandler(
      `registration/select-operator/user-operator/operator/${id}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${id}`,
      {
        body: JSON.stringify(userOperatorData),
      },
    );

    return response;
  };

  const approveRequest = async () => {
    const response = await changeStatus(
      Status.APPROVED,
      userOperator,
      userOperatorId,
    );

    return response;
  };

  const rejectRequest = async () => {
    const response = await changeStatus(
      Status.REJECTED,
      userOperator,
      userOperatorId,
    );

    return response;
  };

  const requestChange = async () => {
    const response = await changeStatus(
      Status.CHANGES_REQUESTED,
      userOperator,
      userOperatorId,
    );

    return response;
  };

  const undoRequestChange = async () => {
    const response = await changeStatus(
      Status.PENDING,
      userOperator,
      userOperatorId,
    );

    return response;
  };

  return (
    <Review
      approvedMessage="You have approved the request for prime admin access."
      rejectedMessage="You have rejected the request for prime admin access."
      confirmApproveMessage="Are you sure you want to approve this request for prime admin access?"
      confirmRejectMessage="Are you sure you want to reject this request for prime admin access?"
      isStatusPending={userOperator.status === Status.PENDING}
      onApprove={approveRequest}
      onReject={rejectRequest}
      onRequestChange={requestChange}
      onUndoRequestChange={undoRequestChange}
    />
  );
}
