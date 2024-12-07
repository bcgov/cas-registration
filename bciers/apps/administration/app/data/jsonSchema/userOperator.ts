import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import TitleOnlyFieldTemplate from "@bciers/components/form/fields/TitleOnlyFieldTemplate";
import {
  OperatorMailingAddressTitle,
  OperatorPhysicalAddressTitle,
  ParentCompanyMailingAddressTitle,
  ParentCompanyPhysicalAddressTitle,
  SeniorOfficerTitle,
} from "@/app/components/form/titles/userOperatorTitles";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";
import { operatorSchema } from "./operator";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

export const userOperatorPage1: RJSFSchema = {
  type: "object",
  title: "Operator Information",
  
  properties: {
    ...operatorSchema.properties.section1.properties,
    ...operatorSchema.properties.section2.properties,
    ...operatorSchema.properties.section3.properties
  },
  
};

export const userOperatorUserInformationPage2: RJSFSchema = {
  type: "object",
  title: "Admin Information",
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
    bceid_business_name: {
      type: "string",
      title: "BCeID Business Name",
    },
    position_title: {
      type: "string",
      title: "Position Title",
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
};

export const userOperatorInternalUserSchema: RJSFSchema = {
  type: "object",
  properties: {
   
    userOperatorPage1,
    userOperatorUserInformationPage2,
  },
};

export const userOperatorUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  // CONTACT INFO SECTION
  email: {
    "ui:widget": "EmailWidget",
  },
  province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  is_senior_officer: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false,
    },
  },
  senior_officer_section: {
    ...subheading,
    "ui:title": SeniorOfficerTitle,
  },
  so_email: {
    "ui:widget": "EmailWidget",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
  so_phone_number: {
    "ui:widget": "PhoneWidget",
  },
  postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  // OPERATOR INFO SECTION
  mailing_address_section: {
    ...subheading,
    "ui:title": OperatorMailingAddressTitle,
  },
  physical_address_section: {
    ...subheading,
    "ui:title": OperatorPhysicalAddressTitle,
  },
  mailing_address_same_as_physical: {
    "ui:widget": "RadioWidget",
  },
  website: {
    "ui:widget": "URLWidget",
  },
  physical_province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  mailing_province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  business_structure: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a business structure",
  },
  physical_postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  mailing_postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  // PARENT OPERATORS SECTION
  parent_operators_section: {
    ...subheading,
  },
  operator_has_parent_operators: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
  },
  parent_operators_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add another parent company",
      title: "Parent Company Information - Parent Company",
    },
    items: {
      po_physical_address_section: {
        ...subheading,
        "ui:title": ParentCompanyPhysicalAddressTitle,
      },
      po_mailing_address_same_as_physical: {
        "ui:widget": "RadioWidget",
      },
      po_business_structure: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a business structure",
      },
      po_physical_province: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      po_mailing_province: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      po_mailing_address_section: {
        ...subheading,
        "ui:title": ParentCompanyMailingAddressTitle,
      },
      po_physical_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
      po_mailing_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
      operator_index: { "ui:widget": "hidden" },
    },
  },
};

export const userOperatorInternalUserUiSchema = {
  ...userOperatorUiSchema,
  // Remove headings since titles are displayed in Accordion header
  "ui:options": {
    label: false,
  },
};