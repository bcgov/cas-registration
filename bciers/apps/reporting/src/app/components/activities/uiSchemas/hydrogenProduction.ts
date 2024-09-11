import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    otherTransformationOfHydrocarbonFeedstock: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      "ui:options": {
        label: false,
      },
      emissions: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Emission Data",
          title: "Emission Data",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "gasType",
            "emission",
            "equivalentEmissions",
            "methodology",
          ],
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: "Gas Type",
              enumOptions: ["CO2"], // You might want to populate this dynamically
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
              label: "Methodology",
              enumOptions: [
                "Alternative Parameter Measurement",
                "Replacement Methodology",
                "Feedstock Material Balance",
                "CEMS",
              ],
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
