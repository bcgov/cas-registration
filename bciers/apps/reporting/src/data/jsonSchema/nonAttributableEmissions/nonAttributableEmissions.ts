import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { NonAttributableEmmissionsInfo } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/additionalMessage";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import RadioWidget from "@bciers/components/form/widgets/RadioWidget";
import SelectWidget from "@bciers/components/form/widgets/SelectWidget";
import CheckboxGroupWidget from "@bciers/components/form/widgets/CheckboxGroupWidget";

export const nonAttributableEmissionSchema: RJSFSchema = {
  type: "object",
  title: "Non-Attributable Emissions",
  properties: {
    info_note: { type: "object", readOnly: true },
    emissions_exceeded: {
      type: "boolean",
      title: "Did your non-attributable emissions exceed 100 tCO2e?",
    },
  },
};

export const nonAttributableEmissionUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["info_note", "emissions_exceeded", "activities"],
  info_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": NonAttributableEmmissionsInfo,
  },
  emissions_exceeded: { "ui:widget": RadioWidget },
  activities: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,

    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Activity",
      padding: "p-2",
      label: false,
      bgColor: "white",
      showHr: true,
    },
    items: {
      "ui:order": ["activity", "source_type", "emission_category", "gas_type"],
      emission_category: {
        "ui:widget": SelectWidget,
        "ui:placeholder": "Select Emissions Category",
        "ui:options": { style: { width: "100%", textAlign: "justify" } },
      },
      gas_type: {
        "ui:widget": CheckboxGroupWidget,
        "ui:options": {
          alignment: "top",
          columns: 3,
        },
      },
    },
  },
};

export const generateUpdatedSchema = (
  gasTypes: { id: number; chemical_formula: string }[],
  emissionCategories: { id: number; category_name: string }[],
): RJSFSchema => ({
  ...nonAttributableEmissionSchema,
  dependencies: {
    emissions_exceeded: {
      oneOf: [
        {
          properties: { emissions_exceeded: { enum: [false] } },
        },
        {
          properties: {
            emissions_exceeded: { enum: [true] },
            activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity: { type: "string", title: "Activity Name" },
                  source_type: { type: "string", title: "Source Type" },
                  gas_type: {
                    type: "array",
                    title: "Gas Type",
                    items: {
                      type: "string",
                      enum: gasTypes.map((gas) => gas.chemical_formula),
                    },
                    uniqueItems: true,
                  },
                  emission_category: {
                    type: "string",
                    title: "Emission Category",
                    enum: emissionCategories.map(
                      (category) => category.category_name,
                    ),
                  },
                },
              },
            },
          },
        },
      ],
    },
  },
});
