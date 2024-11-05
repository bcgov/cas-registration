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
import { Apps, OperationStatus } from "@bciers/utils/src/enums";

import { optedInOperationDetailsUiSchema } from "./optedInOperation";
export const createAdministrationOperationInformationSchema = async (
  registrationPurposesValue: string[],
  optedIn: boolean,
  status: OperationStatus,
): Promise<RJSFSchema> => {
  const administrationOperationInformationSchema: RJSFSchema = {
    type: "object",
    properties: {
      section1: await createOperationInformationSchema(Apps.ADMINISTRATION),
      section2: await createMultipleOperatorsInformationSchema(),
      ...(status === OperationStatus.REGISTERED && {
        section3: await createAdministrationRegistrationInformationSchema(
          registrationPurposesValue,
          optedIn,
        ),
      }),
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
  section3: {
    ...registrationInformationUiSchema,
    "ui:order": [
      "registration_purposes",
      "regulated_operation_preface",
      "regulated_products",
      "opted_in_preface",
      "opted_in_operation",
      "new_entrant_preface",
      "date_of_first_shipment",
      "new_entrant_application",
    ],
    registration_purposes: {
      "ui:widget": "ReadOnlyWidget",
    },
    ...optedInOperationDetailsUiSchema,
  },
};
