import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";

export const complianceSummarySchema: RJSFSchema = {
  type: "object",
  title: "Compliance Summary",
  properties: {
    emissions_attributable_for_reporting: {
      type: "string",
      title: "Emissions attributable for reporting",
    },
    reporting_only_emissions: {
      type: "string",
      title: "Reporting-only emissions",
    },
    emissions_attributable_for_compliance: {
      type: "string",
      title: "Emissions attributable for compliance",
    },
    emissions_limit: {
      type: "string",
      title: "Emissions limit",
    },
    excess_emissions: {
      type: "string",
      title: "Excess emissions",
    },
    credited_emissions: {
      type: "string",
      title: "Credited emissions",
    },
    regulatory_values: {
      type: "object",
      title: "Regulatory values",
      properties: {
        reduction_factor: { type: "string", title: "Reduction factor" },
        tightening_rate: { type: "string", title: "Tightening rate" },
        initial_compliance_period: {
          type: "string",
          title: "Initial compliance period",
          default: "2024",
        },
        compliance_period: {
          type: "string",
          title: "Compliance period",
        },
      },
    },
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          annual_production: {
            type: "string",
            title: "Annual production",
          },
          apr_dec_production: {
            type: "string",
            title: "Production data for Apr 1 - Dec 31 2024",
          },
          emission_intensity: {
            type: "string",
            title: "Production-weighted average emission intensity",
          },
          allocated_industrial_process_emissions: {
            type: "string",
            title: "Allocated industrial process emissions",
          },
          allocated_compliance_emissions: {
            type: "string",
            title: "Allocated Emissions attributable to compliance",
          },
        },
      },
    },
  },
};

export const complianceSummaryUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:disabled": true,
  emissions_attributable_for_reporting: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  reporting_only_emissions: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  emissions_attributable_for_compliance: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  emissions_limit: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  excess_emissions: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  credited_emissions: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  regulatory_values: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
  products: {
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:disabled": true,
    "ui:options": {
      label: false,
      customItemName: true,
      addable: false,
      removable: false,
    },
    items: {
      name: {
        "ui:widget": "hidden",
      },
      annual_production: {
        "ui:options": {
          displayUnit: "production unit",
        },
      },
      emission_intensity: {
        "ui:options": {
          displayUnit: "tCO2e/production unit",
        },
      },
      allocated_industrial_process_emissions: {
        "ui:options": {
          displayUnit: "tCO2e",
        },
      },
      allocated_compliance_emissions: {
        "ui:options": {
          displayUnit: "tCO2e",
        },
      },
    },
  },
};
