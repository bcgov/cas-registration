import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { CapturedEmmissionsInfo } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalMessage";
import { RadioWidget } from "@bciers/components/form/widgets";
import multiSelectWidget from "@bciers/components/form/widgets/MultiSelectWidget";

export const additionalReportingDataSchema: RJSFSchema = {
  type: "object",
  title: "Additional Reporting Data",
  properties: {
    purpose_note: { type: "object", readOnly: true },
    capture_emissions: { type: "boolean", title: "Did you capture emissions?" },
  },
  dependencies: {
    capture_emissions: {
      oneOf: [
        {
          properties: {
            capture_emissions: { enum: [false] },
          },
        },
        {
          properties: {
            capture_emissions: { enum: [true] },
            capture_type: {
              type: "array",
              title: "Capture type",
              items: {
                type: "string",
                enum: [
                  "On-site use",
                  "On-site sequestration",
                  "Off-site transfer",
                ],
              },
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  capture_type: {
                    contains: { enum: ["On-site use"] },
                  },
                },
              },
              then: {
                properties: {
                  emissions_on_site_use: {
                    type: "number",
                    title: "Emissions (t) captured for on-site use",
                  },
                },
              },
            },
            {
              if: {
                properties: {
                  capture_type: {
                    contains: { enum: ["On-site sequestration"] },
                  },
                },
              },
              then: {
                properties: {
                  emissions_on_site_sequestration: {
                    type: "number",
                    title: "Emissions (t) captured for on-site sequestration",
                  },
                },
              },
            },
            {
              if: {
                properties: {
                  capture_type: {
                    contains: { enum: ["Off-site transfer"] },
                  },
                },
              },
              then: {
                properties: {
                  emissions_off_site_transfer: {
                    type: "number",
                    title: "Emissions (t) captured for off-site transfer",
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
};

export const additionalReportingDataUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  additional_data: { "ui:FieldTemplate": SectionFieldTemplate },
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": CapturedEmmissionsInfo,
  },
  capture_emissions: {
    "ui:title": "Did you capture emissions?",
    "ui:widget": RadioWidget,
  },
  capture_type: {
    "ui:widget": multiSelectWidget,
    "ui:options": { style: { width: "100%", textAlign: "justify" } },
    "ui:placeholder": "Capture type",
  },
};
