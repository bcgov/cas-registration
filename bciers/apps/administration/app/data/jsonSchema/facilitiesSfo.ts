import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import { facilitiesLfoUiSchema } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";

const currentYear = new Date().getFullYear();

const section1: RJSFSchema = {
  type: "object",
  title: "Facility Information",
  required: ["name", "type"],
  properties: {
    name: {
      type: "string",
      title: "Facility Name",
      readOnly: true,
    },
    type: {
      type: "string",
      title: "Facility Type",
      readOnly: true,
      anyOf: [
        {
          const: "Single Facility",
          title: "Single Facility Operation",
        },
      ],
    },
    is_current_year: {
      type: "boolean",
      title: `Did this facility begin operations in ${
        currentYear - 1
      } or ${currentYear}?`,
      default: false,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          is_current_year: {
            const: true,
          },
        },
      },
      then: {
        properties: {
          starting_date: {
            type: "string",
            title: "Date of facility starting operations:",
            allOf: [
              { format: "date_format" },
              { format: "starting_date_year" },
            ],
          },
        },
        required: ["starting_date"],
      },
    },
  ],
};

const section2: RJSFSchema = {
  type: "object",
  title: "Facility Address",
  required: ["latitude_of_largest_emissions", "longitude_of_largest_emissions"],
  properties: {
    street_address: {
      type: "string",
      title: "Street Address",
    },
    municipality: {
      type: "string",
      title: "Municipality",
    },
    province: {
      type: "string",
      title: "Province",
      anyOf: provinceOptions,
      default: "BC",
    },
    postal_code: {
      type: "string",
      title: "Postal Code",
      format: "postal-code",
    },
    latitude_of_largest_emissions: {
      type: "number",
      title: "Latitude of Largest Point of Emissions",
      minimum: -90,
      maximum: 90,
    },

    longitude_of_largest_emissions: {
      type: "number",
      title: "Longitude of Largest Point of Emissions",
      minimum: -180,
      maximum: 180,
    },
  },
};

export const facilitiesSfoSchema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2"],
  properties: {
    section1,
    section2,
  },
};

export const facilitiesSfoUiSchema = {
  ...facilitiesLfoUiSchema,
  section1: {
    ...facilitiesLfoUiSchema.section1,
    name: {
      "ui:widget": "ReadOnlyWidget",
    },
    type: {
      "ui:widget": "ReadOnlyWidget",
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    province: {
      "ui:widget": "ReadOnlyComboBoxWidget",
    },
    postal_code: {
      "ui:widget": "PostalCodeWidget",
    },
  },
};
