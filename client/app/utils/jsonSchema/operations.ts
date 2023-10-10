import { RJSFSchema } from "@rjsf/utils";

export const operationSchema: RJSFSchema = {
  type: "object",
  title: "Step 1: Operation General Information",
  required: [
    "operator_id",
    "name",
    "type",
    "naics_code_id",
    "naics_category",
    "reporting_activities",
    "permit_issuing_agency",
    "permit_number",
    // keys that are questions aren't save in the database
    "Did you submit a GHG emissions report for reporting year 2022?",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "legal_land_description",
    "latitude",
    "longitude",
    "npri_id",
    "bcer_permit_id",
  ],
  properties: {
    operator_id: { type: "string", title: "Operator ID" }, // this will ultimately be determined from their login
    name: { type: "string", title: "Operation Name" },
    type: { type: "string", title: "Operation Type" },
    naics_code_id: { type: "number", title: "NAICS Code" },
    naics_category: { type: "number", title: "NAICS Category" },
    reporting_activities: { type: "string", title: "Reporting Activities" },
    permit_issuing_agency: { type: "string", title: "Permit Issuing Agency " },
    permit_number: { type: "number", title: "Permit Number" },
    "Did you submit a GHG emissions report for reporting year 2022?": {
      type: "string",
      enum: ["No", "Yes"],
      default: "No",
    },
    physical_street_address: { type: "string", title: "Physical Address" },
    physical_municipality: { type: "string", title: "Municipality" },
    physical_province: { type: "string", title: "Province" },
    physical_postal_code: { type: "string", title: "Postal Code" },
    legal_land_description: { type: "string", title: "Legal Land Description" },
    latitude: { type: "number", title: "Lat coordinates" },
    longitude: { type: "number", title: "Long coordinates" },
    npri_id: { type: "number", title: "NPRI ID" },
    bcer_permit_id: { type: "number", title: "BCER permit ID" },
    "Does the operation have multiple operators?": {
      type: "string",
      enum: ["No", "Yes"],
      default: "No",
    },
    'Is the operation representative the same as mentioned in "admin access request"?':
      {
        type: "string",
        enum: ["No", "Yes"],
        default: "Yes",
      },
    "Would you like to add an additional operation registration lead?": {
      type: "string",
      enum: ["No", "Yes"],
      default: "No",
    },

    // petrinexids: { type: "number", title: "Petrinex IDs" },
    // regulated_products: { type: "number", title: "Regulated Product Name(s)" },
    // documents: { type: "string", title: "documents" },
    // contacts: { type: "string", title: "contacts" },
  },
  allOf: [
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: "Yes",
          },
        },
      },
      then: {
        properties: {
          previous_year_attributable_emissions: {
            type: "number",
            title: "2022 attributable emissions",
          },
          swrs_facility_id: { type: "number", title: "SWRS Facility ID" },
          bcghrp_id: { type: "number", title: "BCGHG ID" },
        },
        required: [
          "previous_year_attributable_emissions",
          "swrs_facility_id",
          "bcghrp_id",
        ],
      },
    },
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: "No",
          },
        },
      },
      then: {
        properties: {
          current_year_estimated_emissions: {
            type: "number",
            title: "Estimated attributable Emissions for reporting year 2023",
          },
          opt_in: {
            type: "boolean",
            default: false,
            title: "Is the operation an opt-in operation?",
          },
          new_entrant: {
            type: "string",
            enum: ["No", "Yes"],
            title: "Is the operation applying for a new entrant designation?",
          },
          major_new_operation: {
            type: "boolean",
            title: "Is the operation a major new operation?",
          },
        },
        required: [
          "current_year_estimated_emissions",
          "opt_in",
          "new_entrant",
          "major_new_operation",
        ],
      },
      allOf: [
        {
          if: {
            properties: {
              new_entrant: {
                const: "Yes",
              },
            },
          },
          // brianna--to get this to disappear after switching to No, have to clear the new_entrant
          then: {
            properties: {
              start_of_commercial_operation: {
                type: "string",
                format: "date",
                title: "Start of commerical operation",
              },
            },
            required: ["start_of_commercial_operation"],
          },
        },
      ],
      required: [
        "current_year_estimated_emissions",
        "opt_in",
        "new_entrant",
        "major_new_operation",
      ],
    },
    {
      required: [
        "Did you submit a GHG emissions report for reporting year 2022?",
      ],
    },

    {
      if: {
        properties: {
          "Does the operation have multiple operators?": {
            const: "Yes",
          },
        },
      },
      then: {
        properties: {
          operators: {
            type: "array",
            title: "Parent Operators",
            items: {
              type: "string",
              enum: ["foo", "bar", "fuzz", "qux"],
            },
          },
          percentage_ownership: {
            type: "number",
            title: "Percentage of ownership of operation",
          },
        },
        required: ["operators"],
      },
    },
    {
      if: {
        properties: {
          'Is the operation representative the same as mentioned in "admin access request"?':
            {
              const: "No",
            },
        },
      },
      then: {
        properties: {
          "Is the senior officer the same as in the operation form?": {
            type: "string",
            enum: ["No", "Yes"],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                "Is the senior officer the same as in the operation form?": {
                  const: "No",
                },
              },
            },
            then: {
              properties: {
                so: {
                  type: "string",
                  title: "spread the contact stuff here",
                },
              },
            },
          },
        ],
      },
    },
    {
      if: {
        properties: {
          "Would you like to add an additional operation registration lead?": {
            const: "Yes",
          },
        },
      },
      then: {
        properties: {
          orl: {
            type: "string",
            title: "spread the contact stuff here",
          },
        },
      },
    },
  ],
};

export const operationUiSchema = {
  "ui:order": [
    "operator_id",
    "name",
    "type",
    "naics_code_id",
    "naics_category",
    "reporting_activities",
    "permit_issuing_agency",
    "permit_number",
    "Did you submit a GHG emissions report for reporting year 2022?",
    "previous_year_attributable_emissions",
    "swrs_facility_id",
    "bcghrp_id",
    "current_year_estimated_emissions",
    "opt_in",
    "new_entrant",
    "start_of_commercial_operation",
    "major_new_operation",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "mailing_street_address",
    "mailing_municipality",
    "mailing_province",
    "mailing_postal_code",
    "legal_land_description",
    "latitude",
    "longitude",
    "npri_id",
    "bcer_permit_id",
    "Does the operation have multiple operators?",
    "operators",
    "percentage_ownership",
    'Is the operation representative the same as mentioned in "admin access request"?',
    "Is the senior officer the same as in the operation form?",
    "so",
    "Would you like to add an additional operation registration lead?",
    "orl",
  ],
  id: {
    "ui:widget": "hidden",
  },
  // operator_id: {
  //   "ui:widget": "hidden",
  // },
  registered_for_obps: {
    "ui:widget": "hidden",
  },
  naics_code_id: {
    "ui:widget": "select",
  },
};

// mailing_street_address: { type: "string", title: "operator_id" },
//     mailing_municipality: { type: "string", title: "operator_id" },
//     mailing_province: { type: "string", title: "operator_id" },
//     mailing_postal_code: { type: "string", title: "operator_id" },
// "Does the operation have multiple operators?": {
//   type: "boolean",
// },
