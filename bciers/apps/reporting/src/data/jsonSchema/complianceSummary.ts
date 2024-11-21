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
      unit: "tCO2e",
    },
    reportingOnlyEmission: {
      type: "string",
      title: "Reporting-only emissions",
      unit: "tCO2e",
    },
    emissionsLimit: {
      type: "string",
      title: "Emissions limit",
      unit: "tCO2e",
    },
    excessEmissions: {
      type: "string",
      title: "Excess emissions",
      unit: "tCO2e",
    },
    creditedEmissions: {
      type: "string",
      title: "Credited emissions",
      unit: "tCO2e",
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
          title: "Compliance Period",
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
            unit: "production unit",
          },
          emissionIntensity: {
            type: "string",
            title: "Weighted average emission intensity",
            unit: "tCO2e/production unit",
          },
          allocatedIndustrialProcessEmissions: {
            type: "string",
            title: "Emissions allocated to industrial process",
            unit: "tCO2e",
          },
          allocatedComplianceEmissions: {
            type: "string",
            title: "Emissions allocated to compliance",
            unit: "tCO2e",
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
      displayUnit: true,
    },
  },
  reportingOnlyEmission: {
    "ui:options": {
      displayUnit: true,
    },
  },
  emissionsLimit: {
    "ui:options": {
      displayUnit: true,
    },
  },
  excessEmissions: {
    "ui:options": {
      displayUnit: true,
    },
  },
  creditedEmissions: {
    "ui:options": {
      displayUnit: true,
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
          displayUnit: true,
        },
      },
      emissionIntensity: {
        "ui:options": {
          displayUnit: true,
        },
      },
      allocatedIndustrialProcessEmissions: {
        "ui:options": {
          displayUnit: true,
        },
      },
      allocatedComplianceEmissions: {
        "ui:options": {
          displayUnit: true,
        },
      },
    },
  },
};
