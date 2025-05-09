import { RJSFSchema } from "@rjsf/utils";
import { FieldTemplate } from "@bciers/components/form/fields";

export const eioSchema: RJSFSchema = {
  title: "Electricity Import Data",
  type: "object",
  properties: {
    import_specified_electricity: {
      title: "Amount of imported electricity - specified sources",
      type: ["number"],
      minimum: 0,
    },
    import_specified_emissions: {
      title: "Emissions from specified imports",
      type: ["number", "null"],
      minimum: 0,
    },
    import_unspecified_electricity: {
      title: "Amount of imported electricity - unspecified sources",
      type: ["number", "null"],
      minimum: 0,
    },
    import_unspecified_emissions: {
      title: "Emissions from unspecified imports",
      type: ["number", "null"],
      minimum: 0,
    },
    export_specified_electricity: {
      title: "Amount of exported electricity - specified sources",
      type: ["number", "null"],
      minimum: 0,
    },
    export_specified_emissions: {
      title: "Emissions from specified exports",
      type: ["number", "null"],
      minimum: 0,
    },
    export_unspecified_electricity: {
      title: "Amount of exported electricity - unspecified sources",
      type: ["number", "null"],
      minimum: 0,
    },
    export_unspecified_emissions: {
      title: "Emissions from unspecified exports",
      type: ["number", "null"],
      minimum: 0,
    },
    canadian_entitlement_electricity: {
      title: "Amount of electricity categorized as Canadian Entitlement Power",
      type: ["number", "null"],
      minimum: 0,
    },
    canadian_entitlement_emissions: {
      title: "Emissions from Canadian Entitlement Power",
      type: ["number", "null"],
      minimum: 0,
    },
  },
};

export const eioUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  import_specified_electricity: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "MWh",
      width: "70%",
    },
  },
  import_specified_emissions: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  import_unspecified_electricity: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "MWh",
    },
  },
  import_unspecified_emissions: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  export_specified_electricity: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "MWh",
    },
  },
  export_specified_emissions: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  export_unspecified_electricity: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "MWh",
    },
  },
  export_unspecified_emissions: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  canadian_entitlement_electricity: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "MWh",
    },
  },
  canadian_entitlement_emissions: {
    "ui:placeholder": "Data",
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
};
