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
  showRequestChanges?: boolean;
}

export default function UserOperatorReview({
  userOperator,
  userOperatorId,
  operatorId,
  isOperatorNew,
  showRequestChanges,
}: Props) {
  // Reusable function to change the status of the operator
  const changeOperatorStatus = async (status: Status, id: number) => {
    try {
      const response = await actionHandler(
        `registration/operators/${id}`,
        "PUT",
        "",
        {
          body: JSON.stringify({ status }),
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reusable function to change the status of the prime admin
  const changePrimeAdminStatus = async (status: Status, id: number) => {
    try {
      const response = await actionHandler(
        `registration/select-operator/user-operator/operator/${id}/update-status`,
        "PUT",
        "",
        {
          body: JSON.stringify({ status }),
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const approvePrimeAdminRequst = async () => {
    const response = await changePrimeAdminStatus(
      Status.APPROVED,
      userOperatorId as number,
    );

    return response;
  };

  const rejectPrimeAdminRequest = async () => {
    const response = await changePrimeAdminStatus(
      Status.REJECTED,
      userOperatorId as number,
    );

    return response;
  };

  const requestText = isOperatorNew
    ? "creation of the new operator"
    : "prime admin request";

  const approveOperatorRequest = async () => {
    const response = await changeOperatorStatus(
      Status.APPROVED,
      operatorId as number,
    );

    return response;
  };

  const rejectOperatorRequest = async () => {
    const response = await changeOperatorStatus(
      Status.REJECTED,
      operatorId as number,
    );

    return response;
  };

  const requestOperatorChange = async () => {
    const response = await changeOperatorStatus(
      Status.CHANGES_REQUESTED,
      operatorId as number,
    );

    return response;
  };

  const undoRequestOperatorChange = async () => {
    const response = await changeOperatorStatus(
      Status.PENDING,
      operatorId as number,
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
      showRequestChanges={showRequestChanges}
      onRequestChange={requestOperatorChange}
      onUndoRequestChange={undoRequestOperatorChange}
    />
  );
}
