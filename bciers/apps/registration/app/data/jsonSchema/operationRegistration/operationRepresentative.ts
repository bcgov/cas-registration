import {
  ArrayFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import { operationRepresentativePreface } from "./operationRepresentativeText";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { OperationsContacts } from "@/registration/app/components/operations/registration/types";

// Operation Representative Schema - Very similar to Contact Schema(without the existing_bciers_user field)
const section1: RJSFSchema = {
  type: "object",
  title: "Personal Information",
  required: ["first_name", "last_name"],
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
  },
};

const section2: RJSFSchema = {
  type: "object",
  title: "Work Information",
  required: ["position_title"],
  properties: {
    position_title: {
      type: "string",
      title: "Job Title / Position",
    },
  },
};

const section3: RJSFSchema = {
  type: "object",
  title: "Contact Information",
  required: ["email", "phone_number"],
  properties: {
    email: {
      type: "string",
      title: "Business Email Address",
      format: "email",
    },
    phone_number: {
      type: "string",
      title: "Business Telephone Number",
      format: "phone",
    },
  },
};

const section4: RJSFSchema = {
  type: "object",
  title: "Address Information",
  required: ["street_address", "municipality", "province", "postal_code"],
  properties: {
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
};

export const newOperationRepresentativeSchema: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    section1,
    section2,
    section3,
    section4,
  },
};

export const createOperationRepresentativeSchema = (
  existingOperationRepresentatives: OperationsContacts[],
  allContactOptions: ContactRow[],
): RJSFSchema => {
  const hasExistingOperationReps =
    existingOperationRepresentatives &&
    existingOperationRepresentatives.length !== 0;

  const operationRepresentativeSchema: RJSFSchema = {
    title: "Operation Representative",
    type: "object",
    properties: {
      operation_representative_preface: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
      },
      new_operation_representative: {
        type: "array",
        maxItems: 1,
        items: {
          properties: {
            existing_contact_id: {
              type: "number",
              title: "Select Existing Contact (Optional)",
              anyOf: allContactOptions.map((contact) => ({
                type: "number",
                title: `${contact.first_name} ${contact.last_name}`,
                const: contact.id,
              })),
            },
            ...newOperationRepresentativeSchema.properties,
          },
        },
      },
    },
  };

  if (hasExistingOperationReps) {
    // @ts-ignore
    operationRepresentativeSchema.properties.operation_representatives = {
      type: "array",
      title: "Operation Representative(s):",
      items: {
        enum: existingOperationRepresentatives.map(
          (operation_representative) => operation_representative?.id,
        ),
        // @ts-ignore
        enumNames: existingOperationRepresentatives.map(
          (operation_representative) => operation_representative?.full_name,
        ),
      },
    };
  } else {
    // @ts-ignore
    operationRepresentativeSchema.properties.new_operation_representative.default =
      [{}];
  }
  return operationRepresentativeSchema;
};

export const operationRepresentativeUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "operation_representative_preface",
    "operation_representatives",
    "new_operation_representative",
    "existing_contact_id",
    "section1",
    "section2",
    "section3",
    "section4",
  ],
  operation_representative_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationRepresentativePreface,
  },
  operation_representatives: {
    "ui:widget": "ReadOnlyMultiSelectWidget",
    "ui:inline": true,
    "ui:classNames": "[&>div:last-child]:w-full",
  },
  new_operation_representative: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add New Operation Representative",
    },
    items: {
      existing_contact_id: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select Existing Contact",
      },
      section1: {
        "ui:FieldTemplate": SectionFieldTemplate,
        "ui:order": ["first_name", "last_name"],
      },
      section2: {
        "ui:FieldTemplate": SectionFieldTemplate,
        "ui:order": ["position_title"],
      },
      section3: {
        "ui:FieldTemplate": SectionFieldTemplate,
        "ui:order": ["email", "phone_number"],
        email: {
          "ui:widget": "EmailWidget",
        },
        phone_number: {
          "ui:widget": "PhoneWidget",
        },
      },
      section4: {
        "ui:FieldTemplate": SectionFieldTemplate,
        "ui:order": [
          "street_address",
          "municipality",
          "province",
          "postal_code",
        ],
        province: {
          "ui:widget": "ComboBox",
        },
        postal_code: {
          "ui:widget": "PostalCodeWidget",
        },
      },
    },
  },
};

export const createOperationRepresentativeUiSchema = (
  existingContact: boolean = false,
) => {
  // disable first name, last name and email for updating existing contact
  if (existingContact)
    return {
      ...operationRepresentativeUiSchema,
      new_operation_representative: {
        ...operationRepresentativeUiSchema.new_operation_representative,
        items: {
          ...operationRepresentativeUiSchema.new_operation_representative.items,
          section1: {
            ...operationRepresentativeUiSchema.new_operation_representative
              .items.section1,
            "ui:disabled": true,
          },
          section3: {
            ...operationRepresentativeUiSchema.new_operation_representative
              .items.section3,
            email: {
              ...operationRepresentativeUiSchema.new_operation_representative
                .items.section3.email,
              "ui:disabled": true,
            },
          },
        },
      },
    };
  else return operationRepresentativeUiSchema;
};
