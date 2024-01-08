"use client";

import { actionHandler } from "@/app/utils/actions";
import Review from "app/components/button/Review";
import { Status } from "@/app/utils/enums";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface Props {
  userOperator: UserOperatorFormData;
  userOperatorId: number;
  operatorId?: number;
  isOperatorNew?: boolean;
}

export default function UserOperatorReview({
  userOperator,
  userOperatorId,
  operatorId,
  isOperatorNew,
}: Props) {
  async function approveOperatorRequest() {
    try {
      const response = await actionHandler(
        `registration/operators/${operatorId}`,
        "PUT",
        "",
        {
          body: JSON.stringify({ status: Status.APPROVED }),
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function rejectOperatorRequest() {
    try {
      const response = await actionHandler(
        `registration/operators/${operatorId}`,
        "PUT",
        "",
        {
          body: JSON.stringify({ status: Status.REJECTED }),
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function approvePrimeAdminRequst() {
    userOperator.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/select-operator/user-operator/operator/${userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${userOperatorId}`,
      {
        body: JSON.stringify(userOperator),
      }
    );

    return response;
  }

  async function rejectPrimeAdminRequest() {
    userOperator.status = Status.REJECTED;
    const response = await actionHandler(
      `registration/select-operator/user-operator/operator/${userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${userOperatorId}`,
      {
        body: JSON.stringify(userOperator),
      }
    );
    return response;
  }

  const requestText = isOperatorNew
    ? "creation of the new operator"
    : "prime admin request";

  const approveRequest = async () => {
    const response = await changeStatus(
      Status.APPROVED,
      userOperator,
      userOperatorId
    );

    return response;
  };

  const rejectRequest = async () => {
    const response = await changeStatus(
      Status.REJECTED,
      userOperator,
      userOperatorId
    );

    return response;
  };

  const requestChange = async () => {
    const response = await changeStatus(
      Status.CHANGES_REQUESTED,
      userOperator,
      userOperatorId
    );

    return response;
  };

  const undoRequestChange = async () => {
    const response = await changeStatus(
      Status.PENDING,
      userOperator,
      userOperatorId
    );

    return response;
  };

  return (
    <Review
      approvedMessage={`You have approved the ${requestText}.`}
      rejectedMessage={`You have rejected the ${requestText}.`}
      confirmApproveMessage={`Are you sure you want to approve the ${requestText}?`}
      confirmRejectMessage={`Are you sure you want to reject the ${requestText}?`}
      isStatusPending={userOperator.status === Status.PENDING}
      onApprove={
        isOperatorNew ? approveOperatorRequest : approvePrimeAdminRequst
      }
      onReject={isOperatorNew ? rejectOperatorRequest : rejectPrimeAdminRequest}
      onRequestChange={requestChange}
      onUndoRequestChange={undoRequestChange}
    />
  );
}
