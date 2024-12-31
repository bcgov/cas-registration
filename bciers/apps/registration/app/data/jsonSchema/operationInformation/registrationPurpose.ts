import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  getCurrentUsersOperations,
  getRegistrationPurposes,
  getRegulatedProducts,
} from "@bciers/actions/api";
import {
  RegistrationPurposes,
  regulatedOperationPurposes,
} from "@/registration/app/components/operations/registration/enums";
import { UUID } from "crypto";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import {
  operationAdd,
  operationPreface,
  purposePreface,
} from "../operationRegistration/operationInformationText";

export const createRegistrationPurposeSchema = async () => {
  // fetch db values that are dropdown options
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();
  const operations = await getCurrentUsersOperations();
  // Using empty array for anyOf will cause the field to not show up and raise an error
  let operationsAnyOf;
  if (Array.isArray(operations) && operations.length > 0) {
    operationsAnyOf = operations.map(
      (operation: { id: UUID; name: string }) => ({
        const: operation.id,
        title: operation.name,
      }),
    );
  }

  const registrationPurposes = await getRegistrationPurposes();

  // create the schema with the fetched values
  const operationInformationSchema: RJSFSchema = {
    title: "Operation Information",
    type: "object",
    required: ["registration_purpose"],
    properties: {
      purpose_preface: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
      },
      registration_purpose: {
        type: "string",
        title: "The purpose of this registration is to register as a:",
        anyOf: registrationPurposes.map((purpose: string) => ({
          const: purpose,
          title: purpose,
        })),
      },
      operation_preface: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
      },
      operation: {
        type: "string",
        title: "Select your operation:",
        anyOf: operationsAnyOf,
      },
      operation_add: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
      },
    },

    dependencies: {
      registration_purpose: {
        oneOf: registrationPurposes.map((purpose: RegistrationPurposes) => {
          const isRegulatedProducts =
            regulatedOperationPurposes.includes(purpose);
          return {
            ...(isRegulatedProducts && { required: ["regulated_products"] }),
            properties: {
              registration_purpose: {
                type: "string",
                const: purpose,
              },
              ...(isRegulatedProducts && {
                regulated_products: {
                  title: "Regulated Product Name(s)",
                  type: "array",
                  minItems: 1,
                  items: {
                    enum: regulatedProducts.map((product) => product.id),
                    enumNames: regulatedProducts.map((product) => product.name),
                  },
                },
              }),
            },
          };
        }),
      },
    },
  };
  return operationInformationSchema;
};

export const registrationPurposeUISchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui:options": {
    label: false,
  },
  "ui:order": [
    "purpose_preface",
    "registration_purpose",
    "regulated_products",
    "operation_preface",
    "operation",
    "operation_add",
  ],
  purpose_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": purposePreface,
  },
  registration_purpose: {
    "ui:placeholder": "Select Registration Purpose",
    "ui:widget": "ComboBox",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
  operation_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationPreface,
  },
  operation_add: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationAdd,
  },
  operation: {
    "ui:widget": "ComboBox",
  },
};
