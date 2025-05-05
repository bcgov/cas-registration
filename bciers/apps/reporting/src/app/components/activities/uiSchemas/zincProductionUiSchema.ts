import { sourceTypeCheckboxUiSchema } from "./common";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import MethodologyFieldTemplate from "@bciers/components/form/fields/MethodologyFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  reducingAgentsDuringZincProductionn: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    reducingAgentsDuringZincProduction: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      emissions: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Emission",
          padding: "p-2",
          label: false,
        },
        items: {
          "ui:order": [
            "gasType",
            "emission",
            "equivalentEmission",
            "methodology",
          ],
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            "ui:order": [
              "methodology",
              "description",
              "monthsMissingDataProcedures",
              "missingDataDescription",
              "reducingAgents",
            ],
            methodology: {
              "ui:FieldTemplate": MethodologyFieldTemplate,
            },
            monthsMissingDataProcedures: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            missingDataDescription: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            reducingAgents: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Reducing Agent",
                title: "Reducing Agent",
                label: false,
                verticalBorder: true,
              },
              items: {
                "ui:order": ["amountUsed", "carbonContent", "emissionFactor"],
                amountUsed: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                carbonContent: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                emissionFactor: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
              },
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
