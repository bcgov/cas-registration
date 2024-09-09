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
  createRegistrationInformationSchema,
  registrationInformationUiSchema,
} from "./registrationInformation";

export const createAdministrationOperationInformationSchema =
  async (): Promise<RJSFSchema> => {
    const administrationOperationInformationSchema: RJSFSchema = {
      type: "object",
      properties: {
        section1: await createOperationInformationSchema(),
        section2: await createMultipleOperatorsInformationSchema(),
        section3: await createRegistrationInformationSchema(),
      },
    };
    return administrationOperationInformationSchema;
  };

export const administrationOperationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: operationInformationUISchema,
  section2: multipleOperatorsInformationUiSchema,
  section3: registrationInformationUiSchema,
};
