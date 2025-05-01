import { RJSFSchema } from "@rjsf/utils";
import { OperationTypes } from "@bciers/utils/src/enums";
import {
  lfoSchema,
  sfoSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationSchema = (
  facilities: string[],
  schemaType: string,
  isSupplementaryReport: boolean,
  isEIO: boolean,
): RJSFSchema => {
  const schema = schemaType === OperationTypes.SFO ? sfoSchema : lfoSchema;

  if (isSupplementaryReport) {
    schema.properties = schema.properties || {};
    schema.properties.info_note = { type: "object", readOnly: true };
  }
  if (isEIO) {
    schema.required = [];
  }
  return schema;
};
