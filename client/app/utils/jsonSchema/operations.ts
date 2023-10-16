import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import GroupedObjectFieldTemplateWrapper from "@/app/styles/rjsf/GroupedObjectFieldTemplateWrapper";
import { RJSFSchema } from "@rjsf/utils";

export const operationSchema: RJSFSchema = {
  type: "object",
  required: [
    "name",
    "type",
    "naics_code_id",
    "naics_category_id",
    "reporting_activities",
    "permit_issuing_agency",
    "permit_number",
    // keys that are questions aren't saved in the database
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
    verified_by: { type: "string" },
    verified_at: { type: "string" },
    name: { type: "string", title: "Operation Name" },
    type: { type: "string", title: "Operation Type" },
    naics_code_id: { type: "number", title: "NAICS Code" },
    naics_category_id: { type: "number", title: "NAICS Category" },
    reporting_activities: { type: "string", title: "Reporting Activities" },
    permit_issuing_agency: { type: "string", title: "Permit Issuing Agency " },
    permit_number: { type: "string", title: "Permit Number" },
    "Did you submit a GHG emissions report for reporting year 2022?": {
      type: "boolean",
      default: false,
    },
    physical_street_address: { type: "string", title: "Physical Address" },
    physical_municipality: { type: "string", title: "Municipality" },
    physical_province: {
      type: "string",
      title: "Province",
      enum: [
        "NL",
        "PE",
        "NS",
        "NB",
        "QC",
        "ON",
        "MB",
        "SK",
        "AB",
        "BC",
        "YT",
        "NT",
        "NU",
      ],
    },
    physical_postal_code: {
      type: "string",
      title: "Postal Code",
      maxLength: 7,
    },
    legal_land_description: { type: "string", title: "Legal Land Description" },
    latitude: { type: "number", title: "Lat coordinates" },
    longitude: { type: "number", title: "Long coordinates" },
    npri_id: { type: "number", title: "NPRI ID" },
    bcer_permit_id: { type: "number", title: "BCER permit ID" },
    "Does the operation have multiple operators?": {
      type: "boolean",
      default: false,
    },
    'Is the operation representative the same as mentioned in "admin access request"?':
      {
        type: "boolean",
        default: true,
      },
    "Would you like to add an additional operation registration lead?": {
      type: "boolean",
      default: false,
    },
    // temp handling of many to many, will be addressed in #138
    // petrinex_ids: { type: "number", title: "Petrinex IDs" },
    // regulated_products: { type: "number", title: "Regulated Product Name(s)" },
    // documents: { type: "string", title: "documents" },
    // contacts: { type: "string", title: "contacts" },
  },
  allOf: [
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: true,
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
          bcghg_id: { type: "number", title: "BCGHG ID" },
        },
        required: [
          "previous_year_attributable_emissions",
          "swrs_facility_id",
          "bcghg_id",
        ],
      },
    },
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: false,
          },
        },
      },
      then: {
        properties: {
          current_year_estimated_emissions: {
            type: "number",
            title: "Estimated Emissions for reporting year 2023",
            default: undefined,
          },
          opt_in: {
            type: "boolean",
            title: "Is the operation an opt-in operation?",
            default: false,
          },
          new_entrant: {
            type: "boolean",
            title: "Is the operation applying for a new entrant designation?",
            default: false,
          },
          major_new_operation: {
            type: "boolean",
            title: "Is the operation a major new operation?",
            default: false,
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
                const: true,
              },
            },
          },
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
    },
    {
      if: {
        properties: {
          "Does the operation have multiple operators?": {
            const: true,
          },
        },
      },
      then: {
        properties: {
          operators: {
            type: "string",
            title: "To be added in #136",
          },
          percentage_ownership: {
            type: "number",
            title: "Percentage of ownership of operation",
          },
        },
        required: ["percentage_ownership"],
      },
    },
    {
      if: {
        properties: {
          'Is the operation representative the same as mentioned in "admin access request"?':
            {
              const: false,
            },
        },
      },
      then: {
        properties: {
          "Is the senior officer the same as in the operation form?": {
            type: "boolean",
            default: true,
          },
        },
        required: ["Is the senior officer the same as in the operation form?"],
        allOf: [
          {
            if: {
              properties: {
                "Is the senior officer the same as in the operation form?": {
                  const: false,
                },
              },
            },
            then: {
              properties: {
                so: {
                  type: "string",
                  title: "To be added in #136",
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
            const: true,
          },
        },
      },
      then: {
        properties: {
          orl: {
            type: "string",
            title: "To be added in #136",
          },
        },
      },
    },
  ],
};

export const operationUiSchema = {
  "ui:order": [
    "name",
    "type",
    "naics_code_id",
    "naics_category_id",
    "reporting_activities",
    "permit_issuing_agency",
    "permit_number",
    "Did you submit a GHG emissions report for reporting year 2022?",
    "previous_year_attributable_emissions",
    "swrs_facility_id",
    "bcghg_id",
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
    "verified_by",
    "verified_at",
  ],
  "ui:ObjectFieldTemplate": GroupedObjectFieldTemplateWrapper,
  "ui:FieldTemplate": FieldTemplate,

  id: {
    "ui:widget": "hidden",
  },
  verified_by: {
    "ui:widget": "hidden",
  },
  verified_at: {
    "ui:widget": "hidden",
  },
  naics_code_id: {
    "ui:widget": "select",
  },
  physical_province: {
    "ui:widget": "select",
  },
};

export const operationsGroupSchema = [
  {
    title: "Step 1: Operation General Information",
    fields: [
      "name",
      "type",
      "naics_code_id",
      "naics_category_id",
      "reporting_activities",
      "permit_issuing_agency",
      "permit_number",
      "Did you submit a GHG emissions report for reporting year 2022?",
      "previous_year_attributable_emissions",
      "swrs_facility_id",
      "bcghg_id",
      "current_year_estimated_emissions",
      "opt_in",
      "new_entrant",
      "start_of_commercial_operation",
      "major_new_operation",
    ],
  },
  {
    title: "Step 2: Operation Type Information",
    fields: [
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
  },
  {
    title:
      "Step 3: Operation Operator Information - If operation has multiple operators",
    fields: [
      "Does the operation have multiple operators?",
      "operators",
      "percentage_ownership",
    ],
  },
  {
    title: "Step 4: Operation Representative (OR) Information",
    fields: [
      'Is the operation representative the same as mentioned in "admin access request"?',
      "Is the senior officer the same as in the operation form?",
      "so",
      "Would you like to add an additional operation registration lead?",
      "orl",
    ],
  },
];
