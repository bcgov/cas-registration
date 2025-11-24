import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import {
  MANUAL_HANDLING_DECISION_LABELS,
  ManualHandlingDecison,
  ManualHandlingTypes,
} from "@bciers/utils/src/enums";
import { InternalHandlingTypeCreditsNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalHandlingTypeCreditsNote";
import { InternalHandlingTypeObligationNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalHandlingTypeObligationNote";
import { InternalIssueResolvedNote } from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalIssueResolvedNote";

export const internalManualHandlingSchema: RJSFSchema = {
  type: "object",
  title: "Resolve Issue",
  properties: {
    section_header: readOnlyObjectField(
      "Manual Handling of Supplementary Report (Out of BCIERS)",
    ),

    handling_type: {
      type: "string",
    },

    analyst_comment: {
      type: "string",
      title: "Analyst's Comment:",
    },

    director_decision: {
      type: "string",
      title: "Director's Decision:",
      oneOf: [
        {
          const: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
          title:
            MANUAL_HANDLING_DECISION_LABELS[
              ManualHandlingDecison.PENDING_MANUAL_HANDLING
            ],
        },
        {
          const: ManualHandlingDecison.ISSUE_RESOLVED,
          title:
            MANUAL_HANDLING_DECISION_LABELS[
              ManualHandlingDecison.ISSUE_RESOLVED
            ],
        },
      ],
      default: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
    },

    // role flags — set from React
    is_cas_analyst: { type: "boolean", default: false },
    is_cas_director: { type: "boolean", default: false },

    // internal field to control notes display after submit
    _initial_director_decision: {
      type: "string",
      default: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
    },
  },

  allOf: [
    // Pending + earned_credits -> credit_note exists
    {
      if: {
        properties: {
          _initial_director_decision: {
            const: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
          },
          handling_type: { const: ManualHandlingTypes.EARNED_CREDITS },
        },
        required: ["_initial_director_decision", "handling_type"],
      },
      then: {
        properties: {
          credit_note: readOnlyStringField(),
        },
      },
    },
    // Pending + obligation -> obligation_note exists
    {
      if: {
        properties: {
          _initial_director_decision: {
            const: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
          },
          handling_type: { const: ManualHandlingTypes.OBLIGATION },
        },
        required: ["_initial_director_decision", "handling_type"],
      },
      then: {
        properties: {
          obligation_note: readOnlyStringField(),
        },
      },
    },
    // Issue resolved -> resolve_note exists
    {
      if: {
        properties: {
          _initial_director_decision: {
            const: ManualHandlingDecison.ISSUE_RESOLVED,
          },
        },
        required: ["_initial_director_decision"],
      },
      then: {
        properties: {
          resolve_note: readOnlyStringField(),
        },
      },
    },

    // CAS Analyst editable logic
    {
      if: {
        properties: {
          is_cas_analyst: { const: true },
          director_decision: {
            not: { const: ManualHandlingDecison.ISSUE_RESOLVED },
          },
        },
        required: ["is_cas_analyst", "director_decision"],
      },
      then: {
        properties: {
          analyst_comment: { type: "string", title: "Analyst's Comment:" },
        },
      },
      else: {
        properties: {
          analyst_comment: readOnlyStringField("Analyst's Comment:"),
        },
      },
    },

    // CAS Director editable logic
    {
      if: {
        properties: { is_cas_director: { const: true } },
        required: ["is_cas_director"],
      },
      then: {
        properties: {
          director_decision: {
            type: "string",
            title: "Director's Decision:",
            oneOf: [
              {
                const: ManualHandlingDecison.PENDING_MANUAL_HANDLING,
                title:
                  MANUAL_HANDLING_DECISION_LABELS[
                    ManualHandlingDecison.PENDING_MANUAL_HANDLING
                  ],
              },
              {
                const: ManualHandlingDecison.ISSUE_RESOLVED,
                title:
                  MANUAL_HANDLING_DECISION_LABELS[
                    ManualHandlingDecison.ISSUE_RESOLVED
                  ],
              },
            ],
          },
        },
      },
      else: {
        properties: {
          director_decision: readOnlyStringField("Director's Decision:"),
        },
      },
    },
  ],
};

export const internalManualHandlingUiSchema = (
  analystSubmittedDate?: string,
  analystSubmittedBy?: string,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "section_header",
    "credit_note",
    "obligation_note",
    "resolve_note",
    "handling_type",
    "analyst_comment",
    "director_decision",
    "*", // include internal fields like _initial_director_decision and role flags
  ],

  section_header: headerUiConfig,

  credit_note: {
    "ui:widget": InternalHandlingTypeCreditsNote,
    "ui:options": { label: false, inline: true },
  },
  obligation_note: {
    "ui:widget": InternalHandlingTypeObligationNote,
    "ui:options": { label: false, inline: true },
  },
  resolve_note: {
    "ui:widget": InternalIssueResolvedNote,
    "ui:options": { label: false, inline: true },
  },

  handling_type: { "ui:widget": "hidden" },
  is_cas_analyst: { "ui:widget": "hidden" },
  is_cas_director: { "ui:widget": "hidden" },
  _initial_director_decision: { "ui:widget": "hidden" },

  analyst_comment: {
    "ui:widget": "TextAreaWidget",
    "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
  },

  director_decision: {
    "ui:widget": "RadioWidget",
    "ui:classNames": "md:gap-16 [&>div:nth-child(2)]:w-full",
    "ui:options": { inline: false },
  },
});
