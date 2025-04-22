import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

export const eioSchema: RJSFSchema = {
  title: "Electricity Import Data",
  type: "object",
  properties: {
    import_specified_electricity: {
      title: "Amount of imported electricity - specified sources",
      type: "number",
    },
    import_specified_emissions: {
      title: "Emissions from specified imports",
      type: "number",
    },
    import_unspecified_electricity: {
      title: "Amount of imported electricity - unspecified sources",
      type: "number",
    },
    import_unspecified_emissions: {
      title: "Emissions from unspecified imports",
      type: "number",
    },
    export_specified_electricity: {
      title: "Amount of exported electricity - specified sources",
      type: "number",
    },
    export_specified_emissions: {
      title: "Emissions from specified exports",
      type: "number",
    },
    export_unspecified_electricity: {
      title: "Amount of exported electricity - unspecified sources",
      type: "number",
    },
    export_unspecified_emissions: {
      title: "Emissions from unspecified exports",
      type: "number",
    },
    canadian_entitlement_electricity: {
      title: "Amount of electricity categorized as Canadian Entitlement Power",
      type: "number",
    },
    canadian_entitlement_emissions: {
      title: "Emissions from Canadian Entitlement Power",
      type: "number",
    },
  },
};

export const eioUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // "ui:order": ["import_specified_electricity"],
  import_specified_electricity: {
    "ui:FieldTemplate": InlineFieldTemplate,
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
