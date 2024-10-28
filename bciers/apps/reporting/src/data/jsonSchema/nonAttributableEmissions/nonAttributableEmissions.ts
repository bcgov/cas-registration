import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { RadioWidget } from "@bciers/components/form/widgets";
import { NonAttributableEmmissionsInfo } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/additionalMessage";
import selectWidget from "@bciers/components/form/widgets/SelectWidget";

export const nonAttributableEmissionSchema: RJSFSchema = {
  type: "object",
  title: "Additional Reporting Data",
  properties: {
    info_note: { type: "object", readOnly: true },
    emissions_exceeded: {
      type: "boolean",
      title: "Did your non-attributable emissions exceeded 100 tCO2e?",
    },
  },
  dependencies: {
    emissions_exceeded: {
      oneOf: [
        {
          properties: {
            emissions_exceeded: { enum: [false] },
          },
        },
        {
          properties: {
            emissions_exceeded: { enum: [true] },
            activity_name: {
              type: "string",
              title: "Activity name",
            },
            source_type: {
              type: "string",
              title: "Source type",
            },
            emissions_category: {
              type: "string",
              title: "Emissions category",
            },
          },
        },
      ],
    },
  },
};

export const nonAttributableEmissionUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  info_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": NonAttributableEmmissionsInfo,
  },
  emissions_exceeded: {
    "ui:title": "Did you capture emissions?",
    "ui:widget": RadioWidget,
  },
  emissions_category: {
    "ui:widget": selectWidget,
    "ui:options": { style: { width: "100%", textAlign: "justify" } },
    "ui:placeholder": "Emissions category",
  },
};
