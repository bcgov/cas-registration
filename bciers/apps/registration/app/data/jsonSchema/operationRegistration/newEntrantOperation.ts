import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import TitleOnlyFieldTemplate from "@bciers/components/form/fields/TitleOnlyFieldTemplate";
import { GenerateNewEntrantFormMessage } from "apps/registration/app/components/operations/registration/form/titles";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  newEntrantApril1OrLater,
  newEntrantBeforeMarch31,
} from "@bciers/utils/src/urls";

export const newEntrantOperationSchema: RJSFSchema = {
  title: "New Entrant Operation",
  type: "object",
  required: ["date_of_first_shipment", "new_entrant_application"],
  properties: {
    date_of_first_shipment: {
      title: "When is this operation’s date of First Shipment?",
      type: "string",
      enum: ["On or before March 31, 2024", "On or after April 1, 2024"],
      default: "On or after April 1, 2024",
    },
    new_entrant_application: {
      type: "string",
      title: "New Entrant Application and Statutory Declaration",
      format: "data-url",
    },
  },
  dependencies: {
    date_of_first_shipment: {
      allOf: [
        {
          if: {
            properties: {
              date_of_first_shipment: {
                const: "On or before March 31, 2024",
              },
            },
          },
          then: {
            properties: {
              // Not an actual field, just used to display a message
              on_or_before_march_31_section: {
                type: "object",
                readOnly: true,
              },
            },
          },
        },
        {
          if: {
            properties: {
              date_of_first_shipment: {
                const: "On or after April 1, 2024",
              },
            },
          },
          then: {
            properties: {
              // Not an actual field, just used to display a message
              on_or_after_april_1_section: {
                type: "object",
                readOnly: true,
              },
            },
          },
        },
      ],
    },
  },
};

export const newEntrantOperationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "date_of_first_shipment",
    "on_or_before_march_31_section",
    "on_or_after_april_1_section",
    "new_entrant_application",
  ],
  date_of_first_shipment: {
    "ui:widget": "RadioWidget",
    "ui:options": {
      inline: true,
    },
  },
  on_or_before_march_31_section: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": GenerateNewEntrantFormMessage(
      "on or before March 31, 2024",
      newEntrantBeforeMarch31,
    ),
  },
  on_or_after_april_1_section: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": GenerateNewEntrantFormMessage(
      "on or after April 1, 2024",
      newEntrantApril1OrLater,
    ),
  },
  new_entrant_application: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: false,
      filePreview: true,
    },
  },
};
