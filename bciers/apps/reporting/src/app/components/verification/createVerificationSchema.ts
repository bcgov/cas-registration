import { RJSFSchema } from "@rjsf/utils";
import { OperationTypes } from "@bciers/utils/src/enums";
import {
  lfoSchema,
  sfoSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationSchema = (
  schemaType: string,
  isSupplementaryReport: boolean,
  isEIO: boolean,
): RJSFSchema => {
  const baseSchema = schemaType === OperationTypes.SFO ? sfoSchema : lfoSchema;

  // make a copy of the properties from the imported baseSchema so that we can customize it
  // without interfering with subsequent schemas needed when the user navigates to
  // a different report type
  // refer to bug https://github.com/bcgov/cas-registration/issues/4547
  const properties = {
    ...baseSchema.properties,
  };

  const required = [...(baseSchema.required ?? [])];

  if (isSupplementaryReport || isEIO) {
    properties.info_note = {
      type: "object",
      readOnly: true,
    };
  }

  return {
    ...baseSchema,
    properties,
    required: isEIO ? [] : required,
  };
};
