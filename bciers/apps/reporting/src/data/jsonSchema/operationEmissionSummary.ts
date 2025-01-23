import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const operationEmissionSummarySchema: RJSFSchema = {
  type: "object",
  title: "Operation Emission Summary (in tCO2e)",
  properties: {
    attributable_for_reporting: {
      type: "number",
      title: "Emissions attributable for reporting",
    },
    attributable_for_reporting_threshold: {
      type: "number",
      title: "Emissions attributable for reporting threshold",
    },
    reporting_only_emission: {
      type: "number",
      title: "Reporting-only emissions",
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
        },
        onsite: {
          type: "number",
          title: "On-site transportation emissions",
        },
        stationary_combustion: {
          type: "number",
          title: "Stationary fuel combustion emissions",
        },
        venting_useful: { type: "number", title: "Venting emissions - useful" },
        venting_non_useful: {
          type: "number",
          title: "Venting emissions - non-useful",
        },
        waste: { type: "number", title: "Emissions from waste" },
        wastewater: { type: "number", title: "Emissions from wastewater" },
      },
    },
    fuel_excluded: {
      type: "object",
      title: "Emissions excluded by fuel type",
      properties: {
        woody_biomass: {
          type: "number",
          title: "CO2 emissions from excluded woody biomass",
        },
        excluded_biomass: {
          type: "number",
          title: "Other emissions from excluded biomass",
        },
        excluded_non_biomass: {
          type: "number",
          title: "Emissions from excluded non-biomass",
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
        },
        fog_excluded: {
          type: "number",
          title:
            "Emissions from fat, oil and grease collection, refining and storage",
        },
      },
    },
  },
};

export const operationEmissionSummaryUiSchema = {
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
