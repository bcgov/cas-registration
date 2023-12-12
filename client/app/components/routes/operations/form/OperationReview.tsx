"use client";

import { actionHandler } from "@/app/utils/actions";
import Review from "app/components/button/Review";
import { Status } from "@/app/types/types";

interface Props {
  operation: any;
}

const OperationReview = ({ operation }: Props) => {
  const approveRequest = async () => {
    const response = await actionHandler(
      `registration/operations/${operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${operation.id}`,
      {
        body: JSON.stringify({ status: Status.APPROVED }),
      },
    );
    return response;
  };

  const rejectRequest = async () => {
    const response = await actionHandler(
      `registration/operations/${operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${operation.id}`,
      {
        body: JSON.stringify({ status: Status.REJECTED }),
      },
    );
    return response;
  };

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
