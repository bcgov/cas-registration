import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyNumberField,
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

export const internalReviewCreditsIssuanceRequestSchema = (
  isCasAnalyst: boolean,
): RJSFSchema => ({
  type: "object",
  title: "Review Credits Issuance Request",
  properties: {
    section_header: readOnlyObjectField("Earned Credits"),
    earned_credits_amount: readOnlyNumberField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
    bccr_holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
    analyst_header: readOnlyObjectField("Review by Analyst"),
    analyst_suggestion: {
      type: "string",
      title: "Analyst's Suggestion:",
      enum: [
        AnalystSuggestion.READY_TO_APPROVE,
        AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
        AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
      ],
      default: isCasAnalyst ? AnalystSuggestion.READY_TO_APPROVE : undefined,
    },
    analyst_comment: {
      type: "string",
      title: "Analyst's Comment:",
    },
  },
});

const getAnalystSubmissionInfoElement = (
  analystSubmittedBy?: string,
  analystSubmittedDate?: string,
) => {
  if (!analystSubmittedBy && !analystSubmittedDate) return null;

  const formatDate = (dateString: string) => {
    try {
      // Parse the date string as local date to avoid timezone issues
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      // Fallback to original format if parsing fails
      return dateString;
    }
  };

  const formattedDate = analystSubmittedDate
    ? formatDate(analystSubmittedDate)
    : "";

  return (
    <small className="m-0">
      Submitted{analystSubmittedBy ? ` by ${analystSubmittedBy}` : ""}
      {formattedDate ? ` on ${formattedDate}` : ""}
    </small>
  );
};

export const internalReviewCreditsIssuanceRequestUiSchema = (
  analystSubmittedDate?: string,
  analystSubmittedBy?: string,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  section_header: headerUiConfig,
  earned_credits_amount: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": StatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  bccr_holding_account_id: commonReadOnlyOptions,
  analyst_header: headerUiConfig,
  analyst_suggestion: {
    "ui:widget": "RadioWidget",
    // to make the radio buttons full width and align the label to the top
    "ui:classNames": "md:gap-16 [&>div:nth-child(2)]:w-full",
    "ui:options": {
      inline: false,
    },
  },
  analyst_comment: {
    "ui:widget": "TextAreaWidget",
    // to make the textarea full width and align the label to the top
    "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
    "ui:help": getAnalystSubmissionInfoElement(
      analystSubmittedBy,
      analystSubmittedDate,
    ),
  },
});
