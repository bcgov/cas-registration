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
    />
  );
};

export default OperationReview;
