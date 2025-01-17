import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const properties: RJSFSchema = {
  attributableForReporting: {
    type: "number",
    title: "Emissions attributable for reporting",
    minimum: 0,
  },
  attributableForReportingThreshold: {
    type: "number",
    title: "Emissions attributable for reporting threshold",
    minimum: 0,
  },
  reportingOnlyEmission: {
    type: "number",
    title: "Reporting-only emissions",
    minimum: 0,
  },
  emissionCategories: {
    type: "object",
    title: "Emission Categories",
    properties: {
      flaring: { type: "number", title: "Flaring emissions" },
      fugitive: { type: "number", title: "Fugitive emissions" },
      industrialProcess: {
        type: "number",
        title: "Industrial process emissions",
        minimum: 0,
      },
      onSiteTransportation: {
        type: "number",
        title: "On-site transportation emissions",
        minimum: 0,
      },
      stationaryCombustion: {
        type: "number",
        title: "Stationary fuel combustion emissions",
        minimum: 0,
      },
      ventingUseful: {
        type: "number",
        title: "Venting emissions - useful",
        minimum: 0,
      },
      ventingNonUseful: {
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
  fuelExcluded: {
    type: "object",
    title: "Emissions excluded by fuel type",
    properties: {
      woodyBiomass: {
        type: "number",
        title: "CO2 emissions from excluded woody biomass",
        minimum: 0,
      },
      excludedBiomass: {
        type: "number",
        title: "Other emissions from excluded biomass",
        minimum: 0,
      },
      excludedNonBiomass: {
        type: "number",
        title: "Emissions from excluded non-biomass",
        minimum: 0,
      },
    },
  },
  otherExcluded: {
    type: "object",
    title: "Other excluded emissions",
    properties: {
      lfoExcluded: {
        type: "number",
        title:
          "Emissions from line tracing and non-processing and non-compression activities",
        minimum: 0,
      },
      fogExcluded: {
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
  emissionCategories: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
  fuelExcluded: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
  otherExcluded: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,
  },
};

export interface EmissionSummaryFormData {
  attributableForReporting: string;
  attributableForReportingThreshold: string;
  reportingOnlyEmission: string;
  emissionCategories: {
    flaring: string;
    fugitive: string;
    industrialProcess: string;
    onSiteTransportation: string;
    stationaryCombustion: string;
    ventingUseful: string;
    ventingNonUseful: string;
    waste: string;
    wastewater: string;
  };
  fuelExcluded: {
    woodyBiomass: string;
    excludedBiomass: string;
    excludedNonBiomass: string;
  };
  otherExcluded: {
    lfoExcluded: string;
    fogExcluded: string; // To be handled once we implement a way to capture FOG emissions
  };
}
