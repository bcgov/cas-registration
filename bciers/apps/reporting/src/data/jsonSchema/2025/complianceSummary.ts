import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";

export const complianceSummarySchema2025: RJSFSchema = {
  type: "object",
  title: "Compliance Summary",
  properties: {
    emissions_attributable_for_reporting: {
      type: "number",
      title: "Emissions attributable for reporting",
    },
    reporting_only_emissions: {
      type: "number",
      title: "Reporting-only emissions",
    },
    emissions_attributable_for_compliance: {
      type: "number",
      title: "Emissions attributable for compliance",
    },
    emissions_limit: {
      type: "number",
      title: "Emissions limit",
    },
    excess_emissions: {
      type: "number",
      title: "Excess emissions",
    },
    credited_emissions: {
      type: "number",
      title: "Credited emissions",
    },
    regulatory_values: {
      type: "object",
      title: "Regulatory values",
      properties: {
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
            type: "number",
          },
          reduction_factor: { type: "number", title: "Reduction factor" },
          tightening_rate: { type: "number", title: "Tightening rate" },
          annual_production: {
            type: "number",
            title: "Annual production",
          },
          jan_mar_production: {
            type: "number",
            title: "Production data for Jan 1 - Mar 31 2025",
          },
          emission_intensity: {
            type: "number",
            title: "Production-weighted average emission intensity",
          },
          allocated_industrial_process_emissions: {
            type: "number",
            title: "Allocated industrial process emissions",
          },
          allocated_compliance_emissions: {
            type: "number",
            title: "Allocated Emissions attributable to compliance",
          },
        },
      },
    },
  },
};

export const complianceSummaryUiSchema2024 = {
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
      reduction_factor: {
        "ui:options": {},
      },
      tightening_rate: {
        "ui:options": {},
      },
      annual_production: {
        "ui:options": {
          displayUnit: "production unit",
        },
      },
      jan_mar_production: {
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
