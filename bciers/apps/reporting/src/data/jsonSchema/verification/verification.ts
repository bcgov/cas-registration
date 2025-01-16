import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { attachmentNote } from "./verificationText";

export const sfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_names",
    "threats_to_independence",
    "verification_conclusion",
  ],
  properties: {
    verification_body_name: {
      title: "Verification body name",
      type: "string",
    },
    accredited_by: {
      title: "Accredited by",
      type: "string",
      enum: ["ANAB", "SCC"],
    },
    scope_of_verification: {
      title: "Scope of verification",
      type: "string",
      enum: [
        "B.C. OBPS Annual Report",
        "Supplementary Report",
        "Corrected Report",
      ],
    },
    visit_names: {
      title: "Sites visited",
      type: "string",
      enum: ["Facility X", "Other", "None"], // modified in components/verification/createVerificationSchema.ts
    },
    threats_to_independence: {
      title: "Were there any threats to independence noted",
      type: "boolean",
    },
    verification_conclusion: {
      title: "Verification conclusion",
      type: "string",
      enum: ["Positive", "Modified", "Negative"],
    },
    verification_note: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
  },
  dependencies: {
    visit_names: {
      oneOf: [
        {
          properties: {
            visit_names: {
              type: "string",
              minItems: 1,
              not: {
                enum: ["Other", "None"],
              },
            },
            visit_types: {
              type: "string",
              title: "Type of site visit",
              enum: ["Virtual", "In person"],
            },
            threats_to_independence: {
              type: "boolean",
            },
            verification_conclusion: {
              type: "string",
              enum: ["Positive", "Modified", "Negative"],
            },
          },
          required: [
            "visit_types",
            "threats_to_independence",
            "verification_conclusion",
          ],
        },
        {
          properties: {
            visit_names: {
              enum: ["Other"],
            },
            other_facility_name: {
              type: "string",
              title: "Please indicate the site visited",
            },
            other_facility_coordinates: {
              type: "string",
              title: "Geographic coordinates of site",
            },
            visit_types: {
              type: "string",
              title: "Type of site visit",
              enum: ["Virtual", "In person"],
            },
            threats_to_independence: {
              type: "boolean",
            },
            verification_conclusion: {
              type: "string",
              enum: ["Positive", "Modified", "Negative"],
            },
          },
          required: [
            "other_facility_name",
            "other_facility_coordinates",
            "visit_types",
            "threats_to_independence",
            "verification_conclusion",
          ],
        },
        {
          properties: {
            visit_names: {
              enum: ["None"],
            },
            threats_to_independence: {
              type: "boolean",
            },
            verification_conclusion: {
              type: "string",
              enum: ["Positive", "Modified", "Negative"],
            },
          },
          required: ["threats_to_independence", "verification_conclusion"],
        },
      ],
    },
  },
};

export const sfoUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_names",
    "other_facility_name",
    "other_facility_coordinates",
    "visit_types",
    "threats_to_independence",
    "verification_conclusion",
    "verification_note",
  ],
  verification_body_name: {
    "ui:placeholder": "Enter verification body name",
  },
  accredited_by: {
    "ui:placeholder": "Select accrediting body",
  },
  scope_of_verification: {
    "ui:placeholder": "Select scope of verification",
  },
  visit_names: {
    "ui:placeholder": "Select site visited",
  },
  visit_types: {
    "ui:widget": "RadioWidget",
  },
  threats_to_independence: {
    "ui:widget": "RadioWidget",
  },
  verification_conclusion: {
    "ui:placeholder": "Select verification conclusion",
  },
  verification_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": attachmentNote,
  },
};

export const lfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_names",
    "threats_to_independence",
    "verification_conclusion",
  ],
  properties: {
    verification_body_name: {
      title: "Verification body name",
      type: "string",
    },
    accredited_by: {
      title: "Accredited by",
      type: "string",
      enum: ["ANAB", "SCC"],
    },
    scope_of_verification: {
      title: "Scope of verification",
      type: "string",
      enum: [
        "B.C. OBPS Annual Report",
        "Supplementary Report",
        "Corrected Report",
      ],
    },
    visit_names: {
      type: "array",
      title: "Sites visited",
      items: {
        type: "string",
        enum: ["Facility X", "Other", "None"],
      },
      uniqueItems: true,
    },
    visit_types: {
      type: "array",
      items: {
        $ref: "#/definitions/visitTypeItem",
      },
    },
    threats_to_independence: {
      title: "Were there any threats to independence noted",
      type: "boolean",
    },
    verification_conclusion: {
      title: "Verification conclusion",
      type: "string",
      enum: ["Positive", "Modified", "Negative"],
    },
    verification_note: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
  },
  definitions: {
    visitTypeItem: {
      type: "object",
      required: ["visit_type"],
      properties: {
        visit_name: {
          title: "Visit Name",
          type: "string",
          readOnly: true,
        },
        visit_type: {
          title: "Visit Type",
          type: "string",
          enum: ["Virtual", "In person"],
        },
      },
    },
  },
};

export const lfoUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_names",
    "visit_types",
    "threats_to_independence",
    "verification_conclusion",
    "verification_note",
  ],
  verification_body_name: {
    "ui:placeholder": "Enter verification body name",
  },
  accredited_by: {
    "ui:placeholder": "Select accrediting body",
  },
  scope_of_verification: {
    "ui:placeholder": "Select scope of verification",
  },
  visit_names: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select site visited",
  },
  visit_types: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      "ui:order": ["visit_name", "visit_type"],
      visit_name: {
        "ui:widget": "hidden",
      },
      visit_type: {
        "ui:widget": "RadioWidget",
        "ui:options": {
          label: "Type of site visit",
        },
      },
    },
  },
  threats_to_independence: {
    "ui:widget": "RadioWidget",
  },
  verification_conclusion: {
    "ui:placeholder": "Select verification conclusion",
  },
  verification_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": attachmentNote,
  },
};
