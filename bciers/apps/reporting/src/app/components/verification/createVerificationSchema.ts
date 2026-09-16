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
  const schema = schemaType === OperationTypes.SFO ? sfoSchema : lfoSchema;

  if (isSupplementaryReport || isEIO) {
    schema.properties = schema.properties || {};
    schema.properties.info_note = { type: "object", readOnly: true };
  } else {
    // wipe contents of schema.properties.info_note in case user has in the same session
    // also viewed a report that has an info_note in its schema
    // refer to bug https://github.com/bcgov/cas-registration/issues/4547
    if (schema.properties) {
      schema.properties.info_note = {};
    }
  }
  if (isEIO) {
    schema.required = [];
  }
  return schema;
};
