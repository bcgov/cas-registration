"use client";

import { actionHandler } from "@bciers/actions";
import { useSession } from "next-auth/react";
import Review from "@/app/components/button/Review";
import { Status } from "@bciers/utils/src/enums";

interface Props {
  operation: any;
}

const OperationReview = ({ operation }: Props) => {
  const { data: session } = useSession();

  const changeStatus = async (status: Status, id: number) => {
    try {
      const response = await actionHandler(
        `registration/v1/operations/${id}/update-status`,
        "PUT",
        ``,
        {
          body: JSON.stringify({ status }),
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const approveRequest = async () => {
    const response = await changeStatus(Status.APPROVED, operation.id);

    return response;
  };

  const declineRequest = async () => {
    const response = await changeStatus(Status.DECLINED, operation.id);

    return response;
  };

  const requestChange = async () => {
    const response = await changeStatus(Status.CHANGES_REQUESTED, operation.id);

    return response;
  };

  const undoRequestChange = async () => {
    const response = await changeStatus(Status.PENDING, operation.id);

    return response;
  };

  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  if (!operation || !isCasInternal) return null;

  return (
    <Review
      approvedMessage="You have approved the application for a B.C. OBPS Regulated Operation ID."
      declinedMessage="You have declined the application for a B.C. OBPS Regulated Operation ID."
      confirmApproveMessage="Are you sure you want to approve this application for a B.C. OBPS Regulated Operation ID?"
      confirmRejectMessage="Are you sure you want to decline this application for a B.C. OBPS Regulated Operation ID?"
      isStatusPending={operation.status === Status.PENDING}
      operationStatus={operation.status as Status}
      onApprove={approveRequest}
      onReject={declineRequest}
      onRequestChange={requestChange}
      onUndoRequestChange={undoRequestChange}
    />
  );
};

export default OperationReview;
