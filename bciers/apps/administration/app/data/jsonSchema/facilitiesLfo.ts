import { RJSFSchema } from "@rjsf/utils";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import provinceOptions from "@bciers/data/provinces.json";
import InlineArrayFieldTemplate from "@bciers/components/form/fields/InlineArrayFieldTemplate";

const currentYear = new Date().getFullYear();

const section1: RJSFSchema = {
  type: "object",
  title: "Facility Information",
  required: ["name", "type"],
  properties: {
    name: {
      type: "string",
      title: "Facility Name",
    },
    type: {
      type: "string",
      title: "Facility Type",
      anyOf: [
        { const: "Large Facility", title: "Large Facility" },
        { const: "Medium Facility", title: "Medium Facility" },
        { const: "Small Aggregate", title: "Small Aggregate" },
      ],
    },
    well_authorization_numbers: {
      type: "array",
      items: {
        type: "number",
      },
      title: "BC Energy Regulator Well Authorization Number(s)",
    },
    is_current_year: {
      type: "boolean",
      title: `Did this facility begin operations in ${
        currentYear - 1
      } or ${currentYear}?`,
      default: false,
    },
    bcghg_id: { type: "string", title: "BCGHGID" },
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
      default: "",
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

export const facilitiesLfoSchema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2"],
  properties: {
    section1,
    section2,
  },
};

export const facilitiesLfoUiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    type: {
      "ui:widget": "ComboBox",
    },
    is_current_year: {
      "ui:widget": "ToggleWidget",
    },
    starting_date: {
      "ui:widget": "DateWidget",
      "ui:options": {
        maxDate: new Date(),
        minDate: new Date(currentYear - 1, 0, 1),
      },
    },
    well_authorization_numbers: {
      "ui:ArrayFieldTemplate": InlineArrayFieldTemplate,
      "ui:options": {
        arrayAddLabel: "Add Well Authorization Number",
      },
    },
    bcghg_id: {
      "ui:widget": "BcghgIdWidget",
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
