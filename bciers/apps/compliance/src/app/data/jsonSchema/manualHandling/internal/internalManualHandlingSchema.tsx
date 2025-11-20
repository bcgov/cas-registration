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
import { InternalHandlingTypeCreditsNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalHandlingTypeCreditsNote";
import { InternalHandlingTypeObligationNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalHandlingTypeObligationNote";
import { InternalIssueResolvedNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalIssueResolvedNote";

type InternalManualHandlingSchemaProps = {
  isCasAnalyst: boolean;
  handlingType?: string;
  directorDecision?: string;
};
export const internalManualHandlingSchema = ({
  isCasAnalyst,
  handlingType,
  directorDecision,
}: InternalManualHandlingSchemaProps): RJSFSchema => ({
  type: "object",
  title: "Resolve Issue",
  properties: {
    section_header: readOnlyObjectField(
      "Manual Handling of Supplementary Report (Out of BCIERS)",
    ),
    credit_note: readOnlyStringField(),
    obligation_note: readOnlyStringField(),
    resolve_note: readOnlyStringField(), // <-- use resolve_note
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

export const internalManualHandlingUiSchema = (
  handlingType?: "earned_credits" | "obligation",
  directorDecision?: ManualHandlingDecison | string,
  analystSubmittedDate?: string,
  analystSubmittedBy?: string,
): UiSchema => {
  const showCreditNote =
    directorDecision === ManualHandlingDecison.PENDING_MANUAL_HANDLING &&
    handlingType === "earned_credits";

  const showObligationNote =
    directorDecision === ManualHandlingDecison.PENDING_MANUAL_HANDLING &&
    handlingType === "obligation";

  const showResolvedNote =
    directorDecision === ManualHandlingDecison.ISSUE_RESOLVED;

  return {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "form-heading-label",
    section_header: headerUiConfig,

    credit_note: showCreditNote
      ? {
          "ui:widget": InternalHandlingTypeCreditsNote,
          "ui:options": { label: false, inline: true },
        }
      : {
          "ui:widget": "hidden",
        },

    obligation_note: showObligationNote
      ? {
          "ui:widget": InternalHandlingTypeObligationNote,
          "ui:options": { label: false, inline: true },
        }
      : {
          "ui:widget": "hidden",
        },

    resolve_note: showResolvedNote
      ? {
          "ui:widget": InternalIssueResolvedNote,
          "ui:options": { label: false, inline: true },
        }
      : {
          "ui:widget": "hidden",
        },

    analyst_comment: {
      "ui:widget": "TextAreaWidget",
      "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
    },

    director_decision: {
      "ui:widget": "RadioWidget",
      "ui:classNames": "md:gap-16 [&>div:nth-child(2)]:w-full",
      "ui:options": {
        inline: false,
      },
    },
  };
};

// export const internalManualHandlingSchema = ({
//   isCasAnalyst,
//   handlingType,
//   directorDecision,
// }: InternalManualHandlingSchemaProps): RJSFSchema => ({
//   type: "object",
//   title: "Resolve Issue",
//   properties: {
//     section_header: readOnlyObjectField(
//       "Manual Handling of Supplementary Report (Out of BCIERS)",
//     ),
//     credit_note: readOnlyStringField(),
//     obligation_note: readOnlyStringField(),
//     resolve_note: readOnlyStringField(),
//     analyst_comment: {
//       type: "string",
//       title: "Analyst's Comment:",
//     },
//     director_decision: {
//       type: "string",
//       title: "Director's Decision:",
//       enum: [
//         ManualHandlingDecison.PENDING_MANUAL_HANDLING,
//         ManualHandlingDecison.ISSUE_RESOLVED,
//       ],
//       default: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
//     },
//   },
// });

// const getAnalystSubmissionInfoElement = (
//   analystSubmittedBy?: string,
//   analystSubmittedDate?: string,
// ) => {
//   if (!analystSubmittedBy && !analystSubmittedDate) return null;

//   const formatDate = (dateString: string) => {
//     try {
//       // Parse the date string as local date to avoid timezone issues
//       const [year, month, day] = dateString.split("-").map(Number);
//       const date = new Date(year, month - 1, day); // month is 0-indexed
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });
//     } catch (error) {
//       // Fallback to original format if parsing fails
//       return dateString;
//     }
//   };

//   const formattedDate = analystSubmittedDate
//     ? formatDate(analystSubmittedDate)
//     : "";

//   return (
//     <small className="m-0">
//       Submitted{analystSubmittedBy ? ` by ${analystSubmittedBy}` : ""}
//       {formattedDate ? ` on ${formattedDate}` : ""}
//     </small>
//   );
// };

// export const internalManualHandlingUiSchema = (
//   analystSubmittedDate?: string,
//   analystSubmittedBy?: string,
// ): UiSchema => ({
//   "ui:FieldTemplate": FieldTemplate,
//   "ui:classNames": "form-heading-label",
//   section_header: headerUiConfig,
//   credit_note: {
//     "ui:widget": InternalHandlingTypeCreditsNote,
//     "ui:options": { label: false, inline: true },
//   },
//   obligation_note: {
//     "ui:widget": InternalHandlingTypeObligationNote,
//     "ui:options": { label: false, inline: true },
//   },
//   resolvedn_note: {
//     "ui:widget": InternalIssueResolvedNote,
//     "ui:options": { label: false, inline: true },
//   },
//   analyst_comment: {
//     "ui:widget": "TextAreaWidget",
//     // to make the textarea full width and align the label to the top
//     "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
//     "ui:help": getAnalystSubmissionInfoElement(
//       analystSubmittedBy,
//       analystSubmittedDate,
//     ),
//   },
//   director_decision: {
//     "ui:widget": "RadioWidget",
//     // to make the radio buttons full width and align the label to the top
//     "ui:classNames": "md:gap-16 [&>div:nth-child(2)]:w-full",
//     "ui:options": {
//       inline: false,
//     },
//   },
// });
