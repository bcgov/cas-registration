import {
  FieldTemplate,
  InlineFieldTemplate,
} from "@bciers/components/form/fields";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";

/**
 * Common Ui Schema fragments for building an activity's Ui Schema.
 * Mostly applicable to O&G activities as these have a lot of source types with similar requirements.
 */

export const emissionsFieldsUiSchema = {
  "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
  "ui:FieldTemplate": FieldTemplate,
  "ui:options": {
    arrayAddLabel: "Add Emission",
    title: "Emission",
    label: false,
    verticalBorder: true,
    padding: "p-2",
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
};

export const fuelsFieldsUiSchema = {
  "ui:title": "Fuel Data",
  "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
  "ui:FieldTemplate": FieldTemplate,
  "ui:options": {
    arrayAddLabel: "Add Fuel",
    label: false,
    title: "Fuel",
  },
  items: {
    "ui:order": ["fuelType", "emissions"],
    fuelType: {
      "ui:field": "fuelType",
      "ui:FieldTemplate": FieldTemplate,
      "ui:options": {
        label: false,
      },
      "ui:order": [
        "fuelName",
        "fuelClassification",
        "fuelDescription",
        "fuelUnit",
        "annualFuelAmount",
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
      fuelUnit: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
      annualFuelAmount: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
    },
    emissions: emissionsFieldsUiSchema,
  },
};

export const sourceTypeCheckboxUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:widget": CheckboxWidgetLeft,
  "ui:options": {
    label: false,
  },
};

export const sourceSubTypeWithFuelUiSchema = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  units: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:title": "Source sub-type data",
    "ui:options": {
      arrayAddLabel: "Add source sub-type",
      label: false,
      title: "Source sub-type",
      padding: "p-2",
    },
    items: {
      "ui:order": ["sourceSubType", "type", "fuels"],
      sourceSubType: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
      type: {
        "ui:widget": "hidden",
      },
      fuels: fuelsFieldsUiSchema,
    },
  },
};

export const sourceSubTypeWithoutFuelUiSchema = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  units: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:title": "Source sub-type data",
    "ui:options": {
      arrayAddLabel: "Add source sub-type",
      label: false,
      title: "Source sub-type",
      padding: "p-2",
    },
    items: {
      "ui:order": ["sourceSubType", "type", "emissions"],
      sourceSubType: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
      type: {
        "ui:widget": "hidden",
      },
      emissions: emissionsFieldsUiSchema,
    },
  },
};

export const emissionsOnlyUiSchema = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  emissions: emissionsFieldsUiSchema,
};

export const fuelsOnlyUiSchema = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  fuels: fuelsFieldsUiSchema,
};
