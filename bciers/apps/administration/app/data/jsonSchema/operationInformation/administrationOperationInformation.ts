import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  createOperationInformationSchema,
  operationInformationUISchema,
} from "./operationInformation";
import {
  createMultipleOperatorsInformationSchema,
  multipleOperatorsInformationUiSchema,
} from "./multipleOperatorsInformation";
import {
  createAdministrationRegistrationInformationSchema,
  registrationInformationUiSchema,
} from "./administrationRegistrationInformation";
import { Apps } from "@bciers/utils/src/enums";

import { optedInOperationDetailsUiSchema } from "./optedInOperation";
export const createAdministrationOperationInformationSchema = async (
  registrationPurposesValue: string[],
  optedIn: boolean,
): Promise<RJSFSchema> => {
  const administrationOperationInformationSchema: RJSFSchema = {
    type: "object",
    properties: {
      section1: await createOperationInformationSchema(Apps.ADMINISTRATION),
      section2: await createMultipleOperatorsInformationSchema(),
      section3: await createAdministrationRegistrationInformationSchema(
        registrationPurposesValue,
        optedIn,
      ),
    },
  };
  if (
    !administrationOperationInformationSchema.properties ||
    typeof administrationOperationInformationSchema.properties.section3 !==
      "object"
  ) {
    throw new Error(
      "Invalid schema: section3 is not an object or properties is undefined",
    );
  }

  return administrationOperationInformationSchema;
};

export const administrationOperationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: operationInformationUISchema,
  section2: multipleOperatorsInformationUiSchema,
  section3: {
    ...registrationInformationUiSchema,
    "ui:order": [
      "registration_purposes",
      "regulated_products",
      "opted_in_operation",
    ],
    registration_purposes: {
      "ui:widget": "ReadOnlyWidget",
    },
    ...optedInOperationDetailsUiSchema,
  },
};
