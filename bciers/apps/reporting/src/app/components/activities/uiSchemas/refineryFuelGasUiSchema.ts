import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    combustionRefineryFuelGasStillGasFlexigas: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      fuels: {
        "ui:title": "Fuel Data",
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Fuel",
          label: false,
          title: "Fuel",
          padding: "p-2",
        },
        items: {
          "ui:order": ["fuelType", "annualFuelAmount", "emissions"],
          fuelType: {
            "ui:field": "fuelType",
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            fuelName: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            fuelUnit: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            fuelClassification: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
          annualFuelAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          emissions: {
            "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              arrayAddLabel: "Add Emission",
              title: "Emission",
              label: false,
              verticalBorder: true,
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
              },
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
