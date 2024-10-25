import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const facilityEmissionSummarySchema: RJSFSchema = {
  type: "object",
  title: "Emissions Summary (in tCO2e)",
  properties: {
    attributableForReporting: {
      type: "number",
      title: "Emissions attributable for reporting",
    },
    attributableForReportingThreshold: {
      type: "number",
      title: "Emissions attributable for reporting threshold",
    },
    reportingOnlyEmission: {
      type: "number",
      title: "Reporting-only emissions",
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
        },
        onSiteTransportation: {
          type: "number",
          title: "On-site transportation emissions",
        },
        stationaryCombustion: {
          type: "number",
          title: "Stationary fuel combustion emissions",
        },
        ventingUseful: { type: "number", title: "Venting emissions - useful" },
        ventingNonUseful: {
          type: "number",
          title: "Venting emissions - non-useful",
        },
        waste: { type: "number", title: "Emissions from waste" },
        wastewater: { type: "number", title: "Emissions from wastewater" },
      },
    },
    fuelExcluded: {
      type: "object",
      title: "Emissions excluded by fuel type",
      properties: {
        woodyBiomass: {
          type: "number",
          title: "CO2 emissions from excluded woody biomass",
        },
        excludedBiomass: {
          type: "number",
          title: "Other emissions from excluded biomass",
        },
        excludedNonBiomass: {
          type: "number",
          title: "Emissions from excluded non-biomass",
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
        },
        fogExcluded: {
          type: "number",
          title:
            "Emissions from fat, oil and grease collection, refining and storage",
        },
      },
    },
  },
};

export const facilityEmissionSummaryUiSchema = {
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

  // facility_name: {
  //   "ui:options": { style: { width: "100%", textAlign: "left" } },
  // },
  // facility_type: {
  //   "ui:options": { style: { width: "100%", textAlign: "left" } },
  // },
  // facility_bcghgid: {
  //   "ui:readonly": true,
  //   "ui:options": { style: { width: "100%", textAlign: "left" } },
  // },
};
