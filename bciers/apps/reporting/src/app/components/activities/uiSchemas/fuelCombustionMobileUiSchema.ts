import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  mobileFuelCombustionPartOfFacility: {
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
    mobileFuelCombustionPartOfFacility: {
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
          "ui:order": [
            "fuelName",
            "fuelClassification",
            "fuelDescription",
            "q1FuelAmount",
            "q2FuelAmount",
            "q3FuelAmount",
            "q4FuelAmount",
            "annualFuelAmount",
            "emissions",
          ],
          fuelName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          fuelClassification: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          fuelDescription: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          q1FuelAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          q2FuelAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          q3FuelAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          q4FuelAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
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
          },
        },
      },
    },
  },
};

export default uiSchema;