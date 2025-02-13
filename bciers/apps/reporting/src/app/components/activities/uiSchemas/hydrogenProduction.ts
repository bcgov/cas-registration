import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  otherTransformationOfHydrocarbonFeedstock: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    otherTransformationOfHydrocarbonFeedstock: {
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
            "feedstocks",
            "description",
          ],
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              enumOptions: ["CO2"],
              label: "Gas Type",
            },
          },
          emission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmissions: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: false,
              enumOptions: [
                "CEMS",
                "Feedstock Material Balance",
                "Alternative Parameter Measurement Methodology",
                "Replacement Methodology",
              ],
            },
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },

            feedstocks: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Feedstock",
                title: "Feedstocks",
                label: false,
                verticalBorder: true,
              },
              items: {
                "ui:order": [
                  "feedstock",
                  "annualFeedstockAmount",
                  "unitForAnnualFeedstockAmount",
                  "annualHydrogenProduction",
                ],

                feedstock: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                annualFeedstockAmount: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                unitForAnnualFeedstockAmount: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                annualHydrogenProduction: {
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
