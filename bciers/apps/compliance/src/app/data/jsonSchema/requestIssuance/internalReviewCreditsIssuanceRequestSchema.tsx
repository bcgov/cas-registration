import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import TwoStateWidget from "@/compliance/src/app/widgets/TwoStateWidget";
import { AnnualEmissionsReportButtonField } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal-review-credits-issuance-request/AnnualEmissionsReportButton";

const createCreditsIssuanceRequestSection = (): RJSFSchema["properties"] => ({
  sectionHeader: readOnlyObjectField("Earned Credits"),
  earnedCredits: readOnlyStringField("Earned Credits:"),
  issuanceStatus: readOnlyStringField("Status of Issuance:"),
  bccrTradingName: readOnlyStringField("BCCR Trading Name:"),
  bccrHoldingAccountId: readOnlyStringField("BCCR Holding Account ID:"),
});

const createAnalystReviewSection = (): RJSFSchema["properties"] => ({
  analystHeader: readOnlyObjectField("Review by Analyst"),
  analyst_recommendation: {
    type: "string",
    title: "Analyst's Suggestion:",
    oneOf: [
      {
        const: "ready_to_approve",
        title: "Ready to approve",
      },
      {
        const: "require_changes",
        title: "Require changes",
      },
    ],
  },
  analyst_comment: {
    type: "string",
    title: "Analyst's Comment:",
  },
});

export const internalReviewCreditsIssuanceRequestSchema = (): RJSFSchema => ({
  type: "object",
  title: "Review Credits Issuance Request",
  properties: {
    viewAnnualReportButton: {
      type: "null",
      title: "",
    },
    ...createCreditsIssuanceRequestSection(),
    ...createAnalystReviewSection(),
  },
  required: [],
});

const fixedWidthLabelStyle = {
  ...commonReadOnlyOptions,
  "ui:classNames": `${commonReadOnlyOptions["ui:classNames"]} [&>div:first-child]:w-[240px] [&>div:first-child]:mr-[10px]`,
};

export const internalReviewCreditsIssuanceRequestUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:submitButtonOptions": {
    norender: true,
  },

  viewAnnualReportButton: {
    "ui:field": AnnualEmissionsReportButtonField,
    "ui:options": {
      label: false,
    },
  },

  sectionHeader: headerUiConfig,
  earnedCredits: fixedWidthLabelStyle,
  issuanceStatus: fixedWidthLabelStyle,
  bccrTradingName: fixedWidthLabelStyle,
  bccrHoldingAccountId: fixedWidthLabelStyle,

  analystHeader: headerUiConfig,
  analyst_recommendation: {
    "ui:widget": "RadioWidget",
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div>label]:font-normal [&>div:first-child]:w-[240px] [&>div:last-child]:w-auto [&>div:last-child]:ml-[10px] ",
    "ui:options": {
      inline: true,
      required: false,
    },
  },
  analyst_comment: {
    "ui:widget": TwoStateWidget,
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div>label]:font-normal [&>div:first-child]:min-w-[240px] [&>div:last-child]:w-full  [&>div:last-child]:ml-[10px] [&>div:last-child>div]:w-full [&>div:last-child>div>div]:w-full",
    "ui:options": {
      isDisabled: true,
    },
  },
};
