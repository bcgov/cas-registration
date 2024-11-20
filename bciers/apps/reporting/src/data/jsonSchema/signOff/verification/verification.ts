import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { attachmentNote } from "./verificationText";

export const verificationSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_name",
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
    visit_name: {
      title: "Sites visited",
      type: "string",
      enum: ["Other", "None"], // modified in components/signOff/verification/createVerificationSchema.ts
    },
    verification_note: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
  },
  dependencies: {
    visit_name: {
      oneOf: [
        // type_of_facility_visit field display conditon:
        // visit_name has one item
        // visit_name is not "Other" or "None"
        {
          properties: {
            visit_name: {
              type: "string",
              minItems: 1,
              not: {
                enum: ["Other", "None"],
              },
            },
            visit_type: {
              type: "string",
              title: "Type of site visit",
              enum: ["Virtual", "In person"],
            },
          },
          required: ["visit_type"],
        },
        {
          // other_site_details field display condition
          // visit_name has one item
          // visit_name is "Other"
          properties: {
            visit_name: {
              type: "string",
              minItems: 1,
              enum: ["Other"],
            },
            other_facility_name: {
              type: "string",
              title: "Please indicate the site visited",
            },
            other_facility_coordinates: {
              type: "string",
              title: "Geographic coordinates",
            },
            visit_type: {
              type: "string",
              title: "Type of site visit",
              enum: ["Virtual", "In person"],
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
          },
          required: [
            "other_facility_name",
            "other_facility_coordinates",
            "visit_type",
            "threats_to_independence",
            "verification_conclusion",
          ],
        },
      ],
    },
  },
};

export const verificationUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "verification_body_name",
    "accredited_by",
    "scope_of_verification",
    "visit_name",
    "other_facility_name",
    "other_facility_coordinates",
    "visit_type",
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
  visit_name: {
    "ui:placeholder": "Select site visited",
  },
  visit_type: {
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
