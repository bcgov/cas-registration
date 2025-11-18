import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyNumberField,
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { ManualHandlingDecison } from "@bciers/utils/src/enums";

export const internalManualHandlingSchema = (
  isCasAnalyst: boolean,
): RJSFSchema => ({
  type: "object",
  title: "Resolve Issue",
  properties: {
    section_header: readOnlyObjectField(
      "Manual Handling of Supplementary Report (Out of BCIERS)",
    ),
    analyst_comment: {
      type: "string",
      title: "Analyst's Comment:",
    },
    director_decision: {
      type: "string",
      title: "Director's Decision:",
      enum: [
        ManualHandlingDecison.PENDING_MANUAL_HANDLING,
        ManualHandlingDecison.ISSUE_RESOLVED,
      ],
      default: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
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

export const internalManualHandlingUiSchema = (
  analystSubmittedDate?: string,
  analystSubmittedBy?: string,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  section_header: headerUiConfig,
  analyst_comment: {
    "ui:widget": "TextAreaWidget",
    // to make the textarea full width and align the label to the top
    "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
    "ui:help": getAnalystSubmissionInfoElement(
      analystSubmittedBy,
      analystSubmittedDate,
    ),
  },
  director_decision: {
    "ui:widget": "RadioWidget",
    // to make the radio buttons full width and align the label to the top
    "ui:classNames": "md:gap-16 [&>div:nth-child(2)]:w-full",
    "ui:options": {
      inline: false,
    },
  },
});
