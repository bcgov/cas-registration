import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  createOperationInformationSchema,
  operationInformationUISchema,
} from "apps/administration/app/data/jsonSchema/operationInformation/operationInformation";
import {
  createMultipleOperatorsInformationSchema,
  multipleOperatorsInformationUiSchema,
} from "apps/administration/app/data/jsonSchema/operationInformation/multipleOperatorsInformation";
import {
  createRegistrationPurposeSchema,
  registrationPurposeUISchema,
} from "./registrationPurpose";
import { Apps } from "@bciers/utils/src/enums";

export const createRegistrationOperationInformationSchema =
  async (): Promise<RJSFSchema> => {
    const registrationOperationInformationSchema: RJSFSchema = {
      title: "Operation Information",
      type: "object",
      properties: {
        section1: await createRegistrationPurposeSchema(),
        section2: await createOperationInformationSchema(
          Apps.REGISTRATION,
          undefined,
        ),
        section3: await createMultipleOperatorsInformationSchema(),
      },
    };
    return registrationOperationInformationSchema;
  };

export const registrationOperationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  section1: registrationPurposeUISchema,
  section2: operationInformationUISchema,
  section3: multipleOperatorsInformationUiSchema,
};
