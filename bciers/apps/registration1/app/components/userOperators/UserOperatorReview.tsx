"use client";

import { actionHandler } from "@bciers/actions";
import Review from "@/app/components/button/Review";
import {
  OperatorStatus,
  Status,
  UserOperatorRoles,
  UserOperatorStatus,
} from "@bciers/utils/src/enums";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface Props {
  note?: string;
  userOperator: UserOperatorFormData;
  userOperatorId: string;
  onSuccess?: () => void;
  onDecline?: () => void;
  operatorId?: number;
  isOperatorNew?: boolean;
  showRequestChanges?: boolean;
}

export default function UserOperatorReview({
  note,
  userOperator,
  userOperatorId,
  onDecline,
  onSuccess,
  operatorId,
  isOperatorNew,
  showRequestChanges,
}: Props) {
  // Reusable function to change the status of the operator
  const changeOperatorStatus = async (status: Status, id: number) => {
    try {
      const response = await actionHandler(
        `registration/v1/operators/${id}`,
        "PUT",
        "",
        {
          body: JSON.stringify({ status }),
        },
      );
      if (response.status === Status.DECLINED && onDecline) {
        onDecline();
      }
      onSuccess?.();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reusable function to change the status of the prime admin
  const changePrimeAdminStatus = async (status: Status) => {
    try {
      const response = await actionHandler(
        `registration/v1/user-operators/${userOperatorId}/update-status`,
        "PUT",
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

  const declineOperatorRequest = async () => {
    const response = await changeOperatorStatus(
      Status.DECLINED,
      operatorId as number,
    );

    return response;
  };

  return (
    <Review
      approvedMessage={`You have approved the ${requestText}.`}
      declinedMessage={`You have declined the ${requestText}.`}
      confirmApproveMessage={`Are you sure you want to approve the ${requestText}?`}
      confirmRejectMessage={`Are you sure you want to decline the ${requestText}?`}
      isStatusPending={
        userOperator.status === UserOperatorStatus.PENDING &&
        userOperator.operator_status !== OperatorStatus.DECLINED
      }
      note={note}
      onApprove={
        isOperatorNew ? approveOperatorRequest : approvePrimeAdminRequest
      }
      onReject={
        isOperatorNew ? declineOperatorRequest : declinePrimeAdminRequest
      }
      showRequestChanges={showRequestChanges}
    />
  );
}
