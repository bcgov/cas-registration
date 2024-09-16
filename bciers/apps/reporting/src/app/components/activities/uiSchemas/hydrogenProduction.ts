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
            "equivalentEmissions",
            "methodology",
            "feedStocks",
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
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              enumOptions: [
                "CEMS",
                "Feedstock Material Balance",
                "Alternative Parameter Measurement",
                "Replacement Methodology",
              ],
            },
          },
          feedStocks: {
            "ui:title": "Feed Stocks",
            "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              arrayAddLabel: "Add FeedStock",
              title: "Feedstock",
              label: false,
              verticalBorder: true,
            },
            items: {
              "ui:order": [
                "feedStock",
                "annualFeedStockAmount",
                "unitForAnnualFeedstockAmount",
              ],

              feedStock: {
                "ui:FieldTemplate": InlineFieldTemplate,
              },
              annualFeedStockAmount: {
                "ui:FieldTemplate": InlineFieldTemplate,
              },
              "Unit for Annual Feedstock Amount": {
                "ui:FieldTemplate": InlineFieldTemplate,
              },
            },
          },
        },
      },
    },
  },
};
export default uiSchema;
