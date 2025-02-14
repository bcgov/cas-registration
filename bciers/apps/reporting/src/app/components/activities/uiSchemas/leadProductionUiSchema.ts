import { sourceTypeCheckboxUiSchema } from "./common";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  useOfReducingAgentsDuringLeadProduction: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    useOfReducingAgentsDuringLeadProduction: {
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
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            reducingAgents: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Reducing Agent",
                title: "Reducing Agents",
                label: false,
                verticalBorder: true,
              },
              items: {
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
