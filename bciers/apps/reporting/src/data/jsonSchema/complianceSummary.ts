import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";

export const complianceSummarySchema: RJSFSchema = {
  type: "object",
  title: "Emissions Summary (in tCO2e)",
  properties: {
    attributableForReporting: {
      type: "string",
      title: "Emissions attributable for reporting",
    },
    reportingOnlyEmission: {
      type: "string",
      title: "Reporting-only emissions",
    },
    emissionsLimit: {
      type: "string",
      title: "Emissions limit",
    },
    excessEmissions: {
      type: "string",
      title: "Excess emissions",
    },
    creditedEmissions: {
      type: "string",
      title: "Credited emissions",
    },
    regulatoryValues: {
      type: "object",
      title: "Regulatory values",
      properties: {
        reductionFactor: { type: "string", title: "Reduction factor" },
        tighteningRate: { type: "string", title: "Tightening rate" },
        initialCompliancePeriod: {
          type: "string",
          title: "Initial compliance period",
          value: "2024",
        },
        compliancePeriod: {
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
          annualProduction: {
            type: "string",
            title: "Annual production",
          },
          emissionIntensity: {
            type: "string",
            title: "Weighted average emission intensity",
          },
          allocatedIndustrialProcessEmissions: {
            type: "string",
            title: "Emissions allocated to industrial process",
          },
          allocatedComplianceEmissions: {
            type: "string",
            title: "Emissions allocated to compliance",
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
  attributableForReporting: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  reportingOnlyEmission: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  emissionsLimit: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  excessEmissions: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  creditedEmissions: {
    "ui:options": {
      displayUnit: "tCO2e",
    },
  },
  regulatoryValues: {
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
      annualProduction: {
        "ui:options": {
          displayUnit: "production unit",
        },
      },
      emissionIntensity: {
        "ui:options": {
          displayUnit: "tCO2e/production unit",
        },
      },
      allocatedIndustrialProcessEmissions: {
        "ui:options": {
          displayUnit: "tCO2e",
        },
      },
      allocatedComplianceEmissions: {
        "ui:options": {
          displayUnit: "tCO2e",
        },
      },
    },
  },
};
