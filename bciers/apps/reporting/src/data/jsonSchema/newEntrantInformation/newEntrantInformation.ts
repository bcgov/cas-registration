import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  InlineFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { DateWidget } from "@bciers/components/form/widgets";
import { newEntrantInfo } from "@reporting/src/data/jsonSchema/newEntrantInformation/additionalMessage";

export const newEntrantInformationSchema: RJSFSchema = {
  type: "object",
  title: "Additional Reporting Data",
  properties: {
    purpose_note: { type: "object", readOnly: true },
    date_of_authorization: {
      type: "string",
      title: "Date of authorization",
    },
    date_of_first_shipment: {
      type: "string",
      title: "Date of first shipment",
    },
    date_of_new_entrant_period_began: {
      type: "string",
      title: "Date new entrant period began",
    },
    assertion_statement: {
      type: "boolean",
      title: "Assertion statement",
      default: false,
    },

    emission_after_new_entrant: {
      type: "object",
      title: "Emission categories after new entrant period began",
      properties: {
        flaring_emissions: {
          type: "number",
          title: "Flaring emissions",
        },
        fugitive_emissions: {
          type: "number",
          title: "Fugitive emissions",
        },
        industrial_process_emissions: {
          type: "number",
          title: "Industrial process emissions",
        },
        on_site_transportation_emissions: {
          type: "number",
          title: "On-site transportation emissions",
        },
        stationary_fuel_combustion_emissions: {
          type: "number",
          title: "Stationary fuel combustion emissions",
        },
        venting_emissions_useful: {
          type: "number",
          title: "Venting emissions - useful",
        },
        venting_emissions_non_useful: {
          type: "number",
          title: "Venting emissions - non-useful",
        },
        emissions_from_waste: {
          type: "number",
          title: "Emissions from waste",
        },
        emissions_from_wastewater: {
          type: "number",
          title: "Emissions from wastewater",
        },
      },
    },
    emission_excluded_by_fuel_type: {
      type: "object",
      title: "Emissions excluded by fuel type",
      properties: {
        co2_emissions_from_excluded_woody_biomass: {
          type: "number",
          title: "CO2 emissions from excluded woody biomass",
        },
        other_emissions_from_excluded_biomasss: {
          type: "number",
          title: "Other emissions from excluded biomass",
        },
        emissions_from_excluded_non_biomass: {
          type: "number",
          title: "Emissions from excluded non-biomass",
        },
      },
    },
    other_excluded_emissions: {
      type: "object",
      title: "Other excluded emissions",
      properties: {
        emissions_from_line_tracing: {
          type: "number",
          title:
            "Emissions from line tracing and non-processing and non-compression activities",
        },
        emissions_from_fat_oil: {
          type: "number",
          title:
            "Emissions from fat, oil and grease collection, refining and storage ",
        },
      },
    },
  },
};

export const newEntrantInformationUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:options": { label: false },
  "ui:order": [
    "purpose_note",
    "date_of_authorization",
    "date_of_first_shipment",
    "date_of_new_entrant_period_began",
    "assertion_statement",
    "emission_after_new_entrant",
    "emission_excluded_by_fuel_type",
    "other_excluded_emissions",
  ],
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": newEntrantInfo,
  },
  date_of_authorization: {
    "ui:widget": DateWidget,
  },

  date_of_first_shipment: {
    "ui:widget": DateWidget,
  },
  date_of_new_entrant_period_began: {
    "ui:widget": DateWidget,
  },
  emission_after_new_entrant: {
    "ui:FieldTemplate": SectionFieldTemplate,
    flaring_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    fugitive_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    industrial_process_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    on_site_transportation_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    stationary_fuel_combustion_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    venting_emissions_useful: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    venting_emissions_non_useful: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_waste: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_wastewater: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },
  emission_excluded_by_fuel_type: {
    "ui:FieldTemplate": SectionFieldTemplate,
    co2_emissions_from_excluded_woody_biomass: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    other_emissions_from_excluded_biomasss: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_excluded_non_biomass: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },
  other_excluded_emissions: {
    "ui:FieldTemplate": SectionFieldTemplate,
    emissions_from_line_tracing: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_fat_oil: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },
};
