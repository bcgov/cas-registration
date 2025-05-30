import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
} from "../helpers";
import { IssuanceStatusAwaitingNote } from "../../../components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";
import { IssuanceStatusApprovedNote } from "../../../components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { IssuanceStatus } from "../../../utils/getRequestIssuanceTrackStatusData";
import React from "react";

export const StatusNoteWidget = (props: any) => {
  const { value } = props;

  if (value === IssuanceStatus.AWAITING) {
    return <IssuanceStatusAwaitingNote />;
  }

  if (value === IssuanceStatus.APPROVED) {
    return <IssuanceStatusApprovedNote />;
  }

  return null;
};

export const StatusTextWidget = (props: any) => {
  const { value } = props;

  const statusTextMap = {
    [IssuanceStatus.AWAITING]: "Issuance requested, awaiting approval",
    [IssuanceStatus.APPROVED]: "Approved, credits issued in BCCR",
  };

  return <span>{statusTextMap[value as keyof typeof statusTextMap]}</span>;
};

export const trackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    statusHeader: readOnlyObjectField("Status of Issuance"),
    statusNote: readOnlyStringField(""),
    earnedCredits: readOnlyStringField("Earned Credits:"),
    issuanceStatus: readOnlyStringField("Status of Issuance:"),
    bccrTradingName: readOnlyStringField("BCCR Trading Name:"),
    directorsComments: readOnlyStringField("Director's Comments:"),
  },
};

export const trackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  statusHeader: {
    ...headerUiConfig,
    "ui:classNames": "text-bc-bg-blue mt-0 mb-2",
  },
  statusNote: {
    "ui:widget": StatusNoteWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earnedCredits: commonReadOnlyOptions,
  issuanceStatus: {
    ...commonReadOnlyOptions,
    "ui:widget": StatusTextWidget,
  },
  bccrTradingName: commonReadOnlyOptions,
  directorsComments: {
    ...commonReadOnlyOptions,
  },
};
