import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { EarnedCreditsAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCreditsAlertNote";

const readOnlyStringField = (title: string): RJSFSchema => ({
  type: "string",
  title,
  readOnly: true,
});

export const createComplianceSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Summary`,
  properties: {
    preface: {
      type: "object",
      title: `From ${reportingYear} Report`,
      readOnly: true,
    },
    emissionsAttributableForCompliance: readOnlyStringField(
      "Emissions Attributable for Compliance:",
    ),
    emissionLimit: readOnlyStringField("Emissions Limit:"),
    excessEmissions: readOnlyStringField("Excess Emissions:"),
    earnedCreditsPreface: {
      type: "object",
      title: "Earned Credits",
      readOnly: true,
    },
    earnedCreditsAlert: {
      type: "string",
      readOnly: true,
    },
    earnedCredits: readOnlyStringField("Earned Credits:"),
    issuanceStatus: readOnlyStringField("Status of Issuance:"),
  },
});

const sharedReadOnlyOptions = {
  "ui:widget": ReadOnlyWidget,
  "ui:classNames": "[&>div:nth-child(2)]:w-auto",
};

const sharedUiOptions = {
  "ui:options": {
    displayUnit: "tCO2e",
  },
};

export const complianceSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  preface: {
    "ui:classNames": "text-bc-bg-blue mt-1",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
  emissionsAttributableForCompliance: {
    ...sharedReadOnlyOptions,
    ...sharedUiOptions,
  },
  emissionLimit: {
    ...sharedReadOnlyOptions,
    ...sharedUiOptions,
  },
  excessEmissions: {
    ...sharedReadOnlyOptions,
    ...sharedUiOptions,
  },
  earnedCreditsPreface: {
    "ui:classNames": "text-bc-bg-blue mt-8 mb-2",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
  earnedCreditsAlert: {
    "ui:widget": EarnedCreditsAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earnedCredits: {
    ...sharedReadOnlyOptions,
  },
  issuanceStatus: {
    ...sharedReadOnlyOptions,
  },
};
