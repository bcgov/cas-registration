import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const properties: RJSFSchema = {
  attributable_for_reporting: {
    type: "number",
    title: "Emissions attributable for reporting",
    minimum: 0,
  },
  attributable_for_reporting_threshold: {
    type: "number",
    title: "Emissions attributable for reporting threshold",
    minimum: 0,
  },
  reporting_only_emission: {
    type: "number",
    title: "Reporting-only emissions",
    minimum: 0,
  },
  emission_categories: {
    type: "object",
    title: "Emission Categories",
    properties: {
      flaring: { type: "number", title: "Flaring emissions" },
      fugitive: { type: "number", title: "Fugitive emissions" },
      industrial_process: {
        type: "number",
        title: "Industrial process emissions",
        minimum: 0,
      },
      onsite_transportation: {
        type: "number",
        title: "On-site transportation emissions",
        minimum: 0,
      },
      stationary_combustion: {
        type: "number",
        title: "Stationary fuel combustion emissions",
        minimum: 0,
      },
      venting_useful: {
        type: "number",
        title: "Venting emissions - useful",
        minimum: 0,
      },
      venting_non_useful: {
        type: "number",
        title: "Venting emissions - non-useful",
        minimum: 0,
      },
      waste: { type: "number", title: "Emissions from waste", minimum: 0 },
      wastewater: {
        type: "number",
        title: "Emissions from wastewater",
        minimum: 0,
      },
    },
  },
  fuel_excluded: {
    type: "object",
    title: "Emissions excluded by fuel type",
    properties: {
      woody_biomass: {
        type: "number",
        title: "CO2 emissions from excluded woody biomass",
        minimum: 0,
      },
      excluded_biomass: {
        type: "number",
        title: "Other emissions from excluded biomass",
        minimum: 0,
      },
      excluded_non_biomass: {
        type: "number",
        title: "Emissions from excluded non-biomass",
        minimum: 0,
      },
    },
  },
  other_excluded: {
    type: "object",
    title: "Other excluded emissions",
    properties: {
      lfo_excluded: {
        type: "number",
        title:
          "Emissions from line tracing and non-processing and non-compression activities",
        minimum: 0,
      },
      fog_excluded: {
        type: "number",
        title:
          "Emissions from fat, oil and grease collection, refining and storage",
        minimum: 0,
      },
    },
  },
};

export const facilityEmissionSummarySchema: RJSFSchema = {
  type: "object",
  title: "Emissions Summary (in tCO2e)",
  properties,
};

export const operationEmissionSummarySchema: RJSFSchema = {
  type: "object",
  title: "Operation Emission Summary (in tCO2e)",
  properties,
};

export const emissionSummaryUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:disabled": true,
  emission_categories: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
  fuel_excluded: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
  other_excluded: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
};
