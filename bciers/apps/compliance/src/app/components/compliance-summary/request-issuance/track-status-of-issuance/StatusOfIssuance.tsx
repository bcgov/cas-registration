import React from "react";
import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";
import { IssuanceStatusAwaitingNote } from "./IssuanceStatusAwaitingNote";
import {
  IssuanceStatus,
  RequestIssuanceTrackStatusData,
} from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import { IssuanceStatusApprovedNote } from "./IssuanceStatusApprovedNote";

interface Props {
  data: RequestIssuanceTrackStatusData;
}

export const StatusOfIssuance = ({ data }: Props) => {
  const statusConfig = {
    [IssuanceStatus.AWAITING]: {
      statusText: "Issuance requested, awaiting approval",
      statusNote: <IssuanceStatusAwaitingNote />,
    },
    [IssuanceStatus.APPROVED]: {
      statusText: "Approved, credits issued in BCCR",
      statusNote: <IssuanceStatusApprovedNote />,
    },
  };

  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`Status of Issuance`} />
      {
        statusConfig[data.issuanceStatus as keyof typeof statusConfig]
          ?.statusNote
      }
      <InfoRow label="Earned Credits:" value={`${data.earnedCredits}`} />
      <InfoRow
        label="Status of Issuance:"
        value={
          statusConfig[data.issuanceStatus as keyof typeof statusConfig]
            ?.statusText
        }
      />
      <InfoRow label="BCCR Trading Name:" value={data.bccrTradingName} />

      {data.issuanceStatus === IssuanceStatus.APPROVED && (
        <InfoRow label="Director's Comments:" value={data.directorsComments} />
      )}
    </div>
  );
};
