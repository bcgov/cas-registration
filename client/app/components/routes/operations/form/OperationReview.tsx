"use client";

import { actionHandler } from "@/app/utils/actions";
import { useSession } from "next-auth/react";
import Review from "app/components/button/Review";
import { Status } from "@/app/utils/enums";

interface Props {
  operation: any;
}

const OperationReview = ({ operation }: Props) => {
  const { data: session } = useSession();

  const changeStatus = async (
    status: Status,
    operationData: any,
    id: number,
  ) => {
    operationData.status = status;
    const response = await actionHandler(
      `registration/operations/${id}/update-status`,
      "PUT",
      `dashboard/operations/${id}`,
      {
        body: JSON.stringify(operationData),
      },
    );
    return response;
  };

  const approveRequest = async () => {
    const response = await changeStatus(
      Status.APPROVED,
      operation,
      operation.id,
    );

    return response;
  };

  const rejectRequest = async () => {
    const response = await changeStatus(
      Status.REJECTED,
      operation,
      operation.id,
    );

    return response;
  };

  const requestChanges = async () => {
    const response = await changeStatus(
      Status.CHANGES,
      operation,
      operation.id,
    );

    return response;
  };

  const isCasInternal =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  if (!operation || !isCasInternal) return null;

  return (
    <Review
      approvedMessage="You have approved the request for carbon tax exemption."
      rejectedMessage="You have rejected the request for carbon tax exemption."
      confirmApproveMessage="Are you sure you want to approve this request for carbon tax exemption?"
      confirmRejectMessage="Are you sure you want to reject this request for carbon tax exemption?"
      isStatusPending={operation.status === Status.PENDING}
      onApprove={approveRequest}
      onReject={rejectRequest}
      onRequestChanges={requestChanges}
    />
  );
};

export default OperationReview;
