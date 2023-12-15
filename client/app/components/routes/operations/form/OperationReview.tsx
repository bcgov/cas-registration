"use client";

import { actionHandler } from "@/app/utils/actions";
import Review from "app/components/button/Review";
import { Status } from "@/app/types/types";

interface Props {
  operation: any;
}

const OperationReview = ({ operation }: Props) => {
  const approveRequest = async () => {
    operation.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/operations/${operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${operation.id}`,
      {
        body: JSON.stringify(operation),
      },
    );

    return response;
  };

  const rejectRequest = async () => {
    operation.status = Status.REJECTED;
    const response = await actionHandler(
      `registration/operations/${operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${operation.id}`,
      {
        body: JSON.stringify(operation),
      },
    );
    return response;
  };

  if (!operation) return null;

  return (
    <Review
      approvedMessage="You have approved the request for carbon tax exemption."
      rejectedMessage="You have rejected the request for carbon tax exemption."
      confirmApproveMessage="Are you sure you want to approve this request for carbon tax exemption?"
      confirmRejectMessage="Are you sure you want to reject this request for carbon tax exemption?"
      isStatusPending={operation.status === Status.PENDING}
      onApprove={approveRequest}
      onReject={rejectRequest}
    />
  );
};

export default OperationReview;
