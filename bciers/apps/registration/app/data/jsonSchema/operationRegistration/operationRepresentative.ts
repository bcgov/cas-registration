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
import { OperationRepresentative } from "@/registration/app/components/operations/registration/types";

// Operation Representative Schema - Very similar to Contact Schema(without the existing_bciers_user field)
export const newOperationRepresentativeSchema: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    //Not an actual field in the db - this is just to make the form look like the wireframes
    personal_information: {
      type: "object",
      title: "Personal Information",
      readOnly: true,
    },
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
    //Not an actual field in the db - this is just to make the form look like the wireframes
    work_information: {
      type: "object",
      title: "Work Information",
      readOnly: true,
    },
    position_title: {
      type: "string",
      title: "Job Title / Position",
    },
    //Not an actual field in the db - this is just to make the form look like the wireframes
    contact_information: {
      type: "object",
      title: "Contact Information",
      readOnly: true,
    },
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
    //Not an actual field in the db - this is just to make the form look like the wireframes
    address_information: {
      type: "object",
      title: "Address Information",
      readOnly: true,
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
};

export const createOperationRepresentativeSchema = (
  existingOperationRepresentatives: OperationRepresentative[],
  allContactOptions: ContactRow[],
): RJSFSchema => {
  const hasExistingOperationReps =
    existingOperationRepresentatives &&
    existingOperationRepresentatives.length !== 0;

  // Ensure options exist to populate anyOf, otherwise set to undefined
  let existingContactsAnyOf;
  if (Array.isArray(allContactOptions) && allContactOptions.length > 0) {
    existingContactsAnyOf = allContactOptions.map((contact) => ({
      title: `${contact.first_name} ${contact.last_name}`,
      const: contact.id,
    }));
  }

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
          required: [
            "first_name",
            "last_name",
            "position_title",
            "email",
            "phone_number",
            "street_address",
            "municipality",
            "province",
            "postal_code",
          ],
          properties: {
            existing_contact_id: {
              type: "number",
              title: "Select Existing Contact (Optional)",
              ...(existingContactsAnyOf && { anyOf: existingContactsAnyOf }),
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
    "personal_information",
    "first_name",
    "last_name",
    "work_information",
    "position_title",
    "contact_information",
    "email",
    "phone_number",
    "address_information",
    "street_address",
    "municipality",
    "province",
    "postal_code",
  ],
  operation_representative_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationRepresentativePreface,
  },
  operation_representatives: {
    "ui:widget": "OperationRepresentativeWidget",
    "ui:inline": true,
    "ui:classNames": "[&>div:last-child]:w-full",
  },
  new_operation_representative: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:classNames": "mt-1",
    "ui:options": {
      label: false,
      arrayAddLabel: "Add New Operation Representative",
    },
    items: {
      existing_contact_id: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select Existing Contact",
      },
      personal_information: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
      work_information: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
      contact_information: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
      email: {
        "ui:widget": "EmailWidget",
      },
      phone_number: {
        "ui:widget": "PhoneWidget",
      },
      address_information: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
      province: {
        "ui:widget": "ComboBox",
      },
      postal_code: {
        "ui:widget": "PostalCodeWidget",
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
          first_name: {
            ...operationRepresentativeUiSchema.new_operation_representative
              .items.first_name,
            "ui:disabled": true,
          },
          last_name: {
            ...operationRepresentativeUiSchema.new_operation_representative
              .items.last_name,
            "ui:disabled": true,
          },
          email: {
            ...operationRepresentativeUiSchema.new_operation_representative
              .items.email,
            "ui:disabled": true,
          },
        },
      },
    };
  else return operationRepresentativeUiSchema;
};
