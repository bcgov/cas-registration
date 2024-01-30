import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";
import TitleOnlyFieldTemplate from "@/app/styles/rjsf/TitleOnlyFieldTemplate";
import {
  StatutoryDeclarationDisclaimerTitle,
  StatutoryDeclarationUploadFieldTitle,
} from "@/app/components/form/titles/operationsTitles";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

const operationPage1: RJSFSchema = {
  type: "object",
  title: "Operation Information",
  required: [
    "name",
    "type",
    "naics_code_id",
    // keys that are questions aren't saved in the database
  ],
  properties: {
    name: { type: "string", title: "Operation Name" },
    type: {
      type: "string",
      title: "Operation Type",
      enum: ["Single Facility Operation", "Linear Facilities Operation"],
    },
    naics_code_id: {
      type: "number",
      title: "Primary NAICS Code",
    },
    regulated_products: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Regulated Product Name(s)",
    },
    // reporting_activities: {
    //   type: "array",
    //   items: {
    //     type: "number",
    //   },
    //   title: "Reporting Activities",
    // },
    ghg_emissions_section: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      title:
        "Please provide information about the GHG emissions report for 2022",
      type: "object",
      readOnly: true,
    },
    "Did you submit a GHG emissions report for reporting year 2022?": {
      type: "boolean",
      default: false,
    },
    // multiple_operators_section: {
    //   //Not an actual field in the db - this is just to make the form look like the wireframes
    //   title: "Multiple operators information",
    //   type: "object",
    //   readOnly: true,
    // },
    // operation_has_multiple_operators: {
    //   type: "boolean",
    //   title: "Does the operation have multiple operators?",
    //   default: false,
    // },
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
          bcghg_id: { type: "string", title: "BCGHG ID" },
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
          opt_in_section: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title: "Opt-in information",
            type: "object",
            readOnly: true,
          },
          opt_in: {
            type: "boolean",
            title: "Are you applying to be an opted-in operation?",
            default: false,
          },
        },

        required: ["opt_in"],
      },
    },
    // {
    //   if: {
    //     properties: {
    //       operation_has_multiple_operators: {
    //         const: true,
    //       },
    //     },
    //   },
    //   then: {
    //     properties: {
    //       multiple_operators_array: {
    //         type: "array",
    //         default: [{}],
    //         items: {
    //           type: "object",
    //           required: [
    //             "mo_legal_name",
    //             "mo_trade_name",
    //             "mo_cra_business_number",
    //             "mo_bc_corporate_registry_number",
    //             "mo_business_structure",
    //             "mo_percentage_ownership",
    //             "mo_physical_street_address",
    //             "mo_physical_municipality",
    //             "mo_physical_province",
    //             "mo_physical_postal_code",
    //           ],
    //           properties: {
    //             mo_legal_name: {
    //               type: "string",
    //               title: "Legal Name",
    //             },
    //             mo_trade_name: {
    //               type: "string",
    //               title: "Trade Name",
    //             },
    //             mo_cra_business_number: {
    //               type: "number",
    //               title: "CRA Business Number",
    //             },
    //             mo_bc_corporate_registry_number: {
    //               type: "string",
    //               title: "BC Corporate Registry Number",
    //               format: "bc_corporate_registry_number",
    //             },
    //             mo_business_structure: {
    //               type: "string",
    //               title: "Business Structure",
    //             },
    //             mo_website: {
    //               type: "string",
    //               title: "Website (optional)",
    //               format: "uri",
    //             },
    //             mo_percentage_ownership: {
    //               type: "number",
    //               title: "Percentage of ownership of operation (%)",
    //             },
    //             mo_proof_of_authority: {
    //               type: "string",
    //               title:
    //                 "Proof of authority of designated operator from partner company",
    //               format: "data-url",
    //             },
    //             mo_physical_address_section: {
    //               //Not an actual field in the db - this is just to make the form look like the wireframes
    //               title:
    //                 "Please provide information about the physical address of this operator:",
    //               type: "object",
    //               readOnly: true,
    //             },
    //             mo_physical_street_address: {
    //               type: "string",
    //               title: "Physical Address",
    //             },
    //             mo_physical_municipality: {
    //               type: "string",
    //               title: "Municipality",
    //             },
    //             mo_physical_province: {
    //               type: "string",
    //               title: "Province",
    //               anyOf: provinceOptions,
    //             },
    //             mo_physical_postal_code: {
    //               type: "string",
    //               title: "Postal Code",
    //               format: "postal-code",
    //             },
    //             mo_mailing_address_section: {
    //               //Not an actual field in the db - this is just to make the form look like the wireframes
    //               title:
    //                 "Please provide information about the business mailing address of this operator:",
    //               type: "object",
    //               readOnly: true,
    //             },
    //             mo_mailing_address_same_as_physical: {
    //               title:
    //                 "Is the business mailing address the same as the physical address?",
    //               type: "boolean",
    //               default: true,
    //             },
    //           },
    //           allOf: [
    //             {
    //               if: {
    //                 properties: {
    //                   mo_mailing_address_same_as_physical: {
    //                     const: false,
    //                   },
    //                 },
    //               },
    //               then: {
    //                 required: [
    //                   "mo_mailing_street_address",
    //                   "mo_mailing_municipality",
    //                   "mo_mailing_province",
    //                   "mo_mailing_postal_code",
    //                 ],
    //                 properties: {
    //                   mo_mailing_street_address: {
    //                     type: "string",
    //                     title: "Business Mailing Address",
    //                   },
    //                   mo_mailing_municipality: {
    //                     type: "string",
    //                     title: "Municipality",
    //                   },
    //                   mo_mailing_province: {
    //                     type: "string",
    //                     title: "Province",
    //                     anyOf: provinceOptions,
    //                   },
    //                   mo_mailing_postal_code: {
    //                     type: "string",
    //                     title: "Postal Code",
    //                     format: "postal-code",
    //                   },
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     },
    //   },
    // },
  ],
};

const operationPage2: RJSFSchema = {
  type: "object",
  title: "Point of Contact",
  required: [
    "add_another_user_for_point_of_contact",
    "street_address",
    "municipality",
    "province",
    "postal_code",
  ],
  properties: {
    add_another_user_for_point_of_contact: {
      type: "boolean",
      title:
        "Would you like to designate another person to be a point of contact for this application? If approved, this person will receive the BORO ID.",
      default: false,
    },
    street_address: {
      type: "string",
      title: "Business Mailing Address",
    },
    municipality: {
      type: "string",
      title: "Municipality",
    },
    province: {
      type: "string",
      title: "Province",
      anyOf: provinceOptions,
    },
    postal_code: {
      type: "string",
      title: "Postal Code",
      format: "postal-code",
    },
  },
  allOf: [
    {
      if: {
        properties: {
          add_another_user_for_point_of_contact: {
            const: false,
          },
        },
      },
      then: {
        type: "object",
        required: [
          "email",
          "phone_number",
          "first_name",
          "last_name",
          "position_title",
        ],
        properties: {
          first_name: {
            type: "string",
            title: "First Name",
            readOnly: true,
          },
          last_name: {
            type: "string",
            title: "Last Name",
            readOnly: true,
          },
          position_title: {
            type: "string",
            title: "Position Title",
            readOnly: true,
          },
          email: {
            type: "string",
            title: "Email Address",
            format: "email",
            readOnly: true,
          },
          phone_number: {
            type: "string",
            title: "Phone Number",
            format: "phone",
            readOnly: true,
          },
        },
      },
      else: {
        type: "object",
        required: [
          "external_point_of_contact_first_name",
          "external_point_of_contact_last_name",
          "external_point_of_contact_position_title",
          "external_point_of_contact_email",
          "external_point_of_contact_phone_number",
        ],
        properties: {
          external_point_of_contact_first_name: {
            type: "string",
            title: "First Name",
          },
          external_point_of_contact_last_name: {
            type: "string",
            title: "Last Name",
          },
          external_point_of_contact_position_title: {
            type: "string",
            title: "Position Title",
          },
          external_point_of_contact_email: {
            type: "string",
            title: "Email Address",
            format: "email",
          },
          external_point_of_contact_phone_number: {
            type: "string",
            title: "Phone Number",
            format: "phone",
          },
        },
      },
    },
  ],
};

const operationPage3: RJSFSchema = {
  type: "object",
  title: "Statutory Declaration and Disclaimer",
  required: ["statutory_declaration"],
  properties: {
    statutory_declaration_disclaimer_section: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      title: "Statutory Declaration and Disclaimer",
      type: "object",
      readOnly: true,
    },
    statutory_declaration: {
      type: "string",
      title: "Statutory Declaration",
      format: "data-url",
    },
  },
};

export const operationSchema: RJSFSchema = {
  type: "object",
  title: "Operation",
  properties: {
    operationPage1,
    operationPage2,
    operationPage3,
  },
};

export const operationUiSchema = {
  "ui:order": [
    "operationPage1",
    "operationPage2",
    "operationPage3",
    "name",
    "type",
    "naics_code_id",
    "regulated_products",
    /*     "reporting_activities", */
    "ghg_emissions_section",
    "Did you submit a GHG emissions report for reporting year 2022?",
    "previous_year_attributable_emissions",
    "swrs_facility_id",
    "bcghg_id",
    "opt_in_section",
    "opt_in",
    "Does the operation have multiple operators?",
    "operators",
    "percentage_ownership",
    "add_another_user_for_point_of_contact",
    "external_point_of_contact_first_name",
    "first_name",
    "external_point_of_contact_last_name",
    "last_name",
    "external_point_of_contact_position_title",
    "position_title",
    "street_address",
    "municipality",
    "province",
    "postal_code",
    "external_point_of_contact_email",
    "email",
    "external_point_of_contact_phone_number",
    "phone_number",
    // "multiple_operators_section",
    // "operation_has_multiple_operators",
    // "multiple_operators_array",
    "mo_percentage_ownership",
    "mo_mailing_address_same_as_physical",
    "mo_mailing_address_section",
    "mo_mailing_street_address",
    "mo_mailing_municipality",
    "mo_mailing_province",
    "mo_mailing_postal_code",
    "statutory_declaration_disclaimer_section",
    "statutory_declaration",
    "random_file",
  ],
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  type: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select operation type",
  },
  naics_code_id: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select Primary NAICS code",
  },
  "Did you submit a GHG emissions report for reporting year 2022?": {
    "ui:widget": "RadioWidget",
  },
  ghg_emissions_section: {
    ...subheading,
  },
  operation_has_multiple_operators: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
  },
  add_another_user_for_point_of_contact: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false,
    },
  },
  opt_in_section: {
    ...subheading,
  },
  opt_in: {
    "ui:widget": "RadioWidget",
  },
  province: {
    "ui:widget": "ComboBox",
  },
  // multiple_operators_section: {
  //   ...subheading,
  // },
  // multiple_operators_array: {
  //   "ui:FieldTemplate": FieldTemplate,
  //   "ui:ArrayFieldTemplate": ArrayFieldTemplate,
  //   "ui:options": {
  //     label: false,
  //     arrayAddLabel: "Add another operator",
  //     title: "Multiple Operator(s) information - Operator",
  //   },
  //   items: {
  //     mo_physical_address_section: {
  //       ...subheading,
  //       "ui:title": OperatorPhysicalAddressTitle,
  //     },
  //     mo_percentage_ownership: {
  //       "ui:options": {
  //         max: 100,
  //       },
  //     },
  //     mo_mailing_address_same_as_physical: {
  //       "ui:widget": "RadioWidget",
  //     },
  //     mo_business_structure: {
  //       "ui:widget": "ComboBox",
  //       "ui:placeholder": "Select a business structure",
  //     },
  //     mo_physical_province: {
  //       "ui:widget": "ComboBox",
  //     },
  //     mo_mailing_province: {
  //       "ui:widget": "ComboBox",
  //     },
  //     mo_mailing_address_section: {
  //       ...subheading,
  //       "ui:title": OperatorMailingAddressTitle,
  //     },
  //     mo_physical_postal_code: {
  //       "ui:widget": "PostalCodeWidget",
  //     },
  //     mo_mailing_postal_code: {
  //       "ui:widget": "PostalCodeWidget",
  //     },
  //   },
  // },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select regulated products",
  },
  // reporting_activities: {
  //   "ui:widget": "MultiSelectWidget",
  //   "ui:placeholder": "Select reporting activities",
  // },
  postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
  external_point_of_contact_phone_number: {
    "ui:widget": "PhoneWidget",
  },
  external_point_of_contact_email: {
    "ui:widget": "EmailWidget",
  },
  statutory_declaration_disclaimer_section: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": StatutoryDeclarationDisclaimerTitle,
  },
  statutory_declaration: {
    "ui:widget": "FileWidget",
    "ui:options": {
      filePreview: true,
      accept: ".pdf",
    },
    "ui:title": StatutoryDeclarationUploadFieldTitle,
  },
};
