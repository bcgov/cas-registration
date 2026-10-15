import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const ReportHistoryActionCell = ({
  id: reportVersionId,
  value: reportStatus,
}: GridRenderCellParams) => {
  const router = useRouter();
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  const buttonConfig = (() => {
    if (!reportVersionId)
      return { text: "", action: async () => {}, disabled: true };

    switch (reportStatus) {
      case ReportOperationStatus.DRAFT:
        return {
          text: "Continue",
          action: async () =>
            router.push(
              `/reports/${reportVersionId}/review-operation-information`,
            ),
          disabled: false,
        };
      case ReportOperationStatus.SUBMITTED:
        return {
          text: "View Details",
          action: async () =>
            router.push(`/reports/${reportVersionId}/submitted`),
          disabled: false,
        };
      default:
        return { text: "", action: async () => {}, disabled: true };
    }
  })();

  return (
    <Button
      className={`w-30 h-10 rounded-[5px] border border-solid border-bc-link-blue ${
        buttonConfig.disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      color="primary"
      disabled={buttonConfig.disabled || hasClicked}
      onClick={async () => {
        setHasClicked(true);
        await buttonConfig.action();
      }}
    >
      {buttonConfig.text}
    </Button>
  );
};

export default ReportHistoryActionCell;
