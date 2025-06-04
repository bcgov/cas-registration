import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { IssuanceStatusAwaitingNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";
import { IssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { IssuanceStatus } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";

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
    status_header: readOnlyObjectField("Status of Issuance"),
    status_note: readOnlyStringField(""),
    earned_credits: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },
  if: {
    properties: {
      issuance_status: { enum: [IssuanceStatus.APPROVED] },
    },
  },
  then: {
    properties: {
      directors_comments: readOnlyStringField("Director's Comments:"),
    },
  },
};

export const trackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  status_header: {
    ...headerUiConfig,
    "ui:classNames": "text-bc-bg-blue mt-0 mb-2",
  },
  status_note: {
    "ui:widget": StatusNoteWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earned_credits: commonReadOnlyOptions,
  issuance_status: {
    ...commonReadOnlyOptions,
    "ui:widget": StatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  directors_comments: commonReadOnlyOptions,
};
