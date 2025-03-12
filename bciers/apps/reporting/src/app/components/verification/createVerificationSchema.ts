import { RJSFSchema } from "@rjsf/utils";
import { lfoSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { OperationTypes } from "@bciers/utils/src/enums";

// TEMPORARY: remmed outcode to support #607
export const createVerificationSchema = (
  facilities: string[],
  schemaType: string,
): RJSFSchema => {
  // Determine the schema based on the schemaType
  const localSchema: RJSFSchema =
    schemaType === OperationTypes.SFO ? { ...sfoSchema } : { ...lfoSchema };

  // const defaultVisistValues = ["None", "Other"];
  // (localSchema.properties?.visit_names as any).items.enum = [
  //   ...defaultVisistValues,
  //   ...facilities,
  // ];

  // Return the customized schema.
  return localSchema;
};
