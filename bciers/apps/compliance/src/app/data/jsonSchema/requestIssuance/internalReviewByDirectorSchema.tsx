import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import TwoStateWidget from "@/compliance/src/app/widgets/TwoStateWidget";
import DirectorReviewAlertWidget from "@/compliance/src/app/widgets/DirectorReviewAlertWidget";
import { AnnualEmissionsReportButtonField } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal-review-credits-issuance-request/AnnualEmissionsReportButton";

const createCreditsIssuanceRequestSection = (): RJSFSchema["properties"] => ({
  sectionHeader: readOnlyObjectField("Earned Credits"),
  earnedCredits: readOnlyStringField("Earned Credits:"),
  issuanceStatus: readOnlyStringField("Status of Issuance:"),
  bccrTradingName: readOnlyStringField("BCCR Trading Name:"),
  bccrHoldingAccountId: readOnlyStringField("BCCR Holding Account ID:"),
});

const createAnalystReviewSection = (): RJSFSchema["properties"] => ({
  analystHeader: readOnlyObjectField("Reviewed by Analyst"),
  analyst_comment: readOnlyStringField("Analyst's Comment:"),
});

const createDirectorReviewSection = (): RJSFSchema["properties"] => ({
  directorHeader: readOnlyObjectField("Review by Director"),
  director_comment: {
    type: "string",
    title: "Director's Comment:",
  },
});

export const internalReviewByDirectorSchema = (): RJSFSchema => ({
  type: "object",
  title: "Review by Director",
  properties: {
    viewAnnualReportButton: {
      type: "null",
      title: "",
    },
    ...createCreditsIssuanceRequestSection(),
    ...createAnalystReviewSection(),
    ...createDirectorReviewSection(),
    directorAlertPlaceholder: readOnlyStringField(),
  },
  required: [],
});

const fixedWidthLabelStyle = {
  ...commonReadOnlyOptions,
  "ui:classNames": `${commonReadOnlyOptions["ui:classNames"]} [&>div:first-child]:w-[240px] [&>div:first-child]:mr-[10px]`,
};

export const internalReviewByDirectorUiSchema: UiSchema = {
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
  analyst_comment: fixedWidthLabelStyle,

  directorHeader: headerUiConfig,
  director_comment: {
    "ui:widget": TwoStateWidget,
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div>label]:font-normal [&>div:first-child]:min-w-[240px] [&>div:last-child]:w-full  [&>div:last-child]:ml-[10px] [&>div:last-child>div]:w-full [&>div:last-child>div>div]:w-full mb-[2px]",
    "ui:options": {
      isDisabled: false,
      showSubmissionInfo: false,
    },
  },
  directorAlertPlaceholder: {
    "ui:widget": DirectorReviewAlertWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
};
