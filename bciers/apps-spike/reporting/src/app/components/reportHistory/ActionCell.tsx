import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
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
      sx={{
        width: 120,
        height: 40,
        borderRadius: "5px",
        border: `1px solid ${BC_GOV_LINKS_COLOR}`,
        cursor: buttonConfig.disabled ? "not-allowed" : "pointer",
      }}
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
