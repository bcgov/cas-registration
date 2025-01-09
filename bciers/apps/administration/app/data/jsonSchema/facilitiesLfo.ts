import { RJSFSchema } from "@rjsf/utils";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import provinceOptions from "@bciers/data/provinces.json";
import InlineArrayFieldTemplate from "@bciers/components/form/fields/InlineArrayFieldTemplate";

const currentYear = new Date().getFullYear();

const addressSection: RJSFSchema = {
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
    bcghg_id: { type: "string", title: "BCGHGID" },
  },
  dependencies: {
    type: {
      oneOf: [
        {
          required: addressSection.required,
          properties: {
            type: {
              const: "Large Facility",
            },
            ...addressSection.properties,
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
          },
          dependencies: {
            is_current_year: {
              oneOf: [
                {
                  properties: {
                    is_current_year: {
                      const: false,
                    },
                  },
                },
                {
                  properties: {
                    is_current_year: {
                      const: true,
                    },
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
              ],
            },
          },
        },
        {
          required: addressSection.required,
          properties: {
            type: {
              const: "Medium Facility",
            },
            ...addressSection.properties,
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
          },
          dependencies: {
            is_current_year: {
              oneOf: [
                {
                  properties: {
                    is_current_year: {
                      const: false,
                    },
                  },
                },
                {
                  properties: {
                    is_current_year: {
                      const: true,
                    },
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
              ],
            },
          },
        },
        {
          properties: {
            type: {
              const: "Small Aggregate",
            },
          },
        },
      ],
    },
  },
};

export const facilitiesLfoSchema: RJSFSchema = {
  type: "object",
  properties: {
    section1,
  },
};

export const facilitiesLfoUiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:order": [
      "name",
      "type",
      "is_current_year",
      "starting_date",
      "well_authorization_numbers",
      "bcghg_id",
      "street_address",
      "municipality",
      "province",
      "postal_code",
      "latitude_of_largest_emissions",
      "longitude_of_largest_emissions",
    ],
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
    province: {
      "ui:widget": "ReadOnlyComboBoxWidget",
    },
    postal_code: {
      "ui:widget": "PostalCodeWidget",
    },
  },
};
