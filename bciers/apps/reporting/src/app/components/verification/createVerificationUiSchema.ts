import { RJSFSchema } from "@rjsf/utils";
import { lfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationUiSchema = (
  schemaType: "SFO" | "LFO",
): RJSFSchema => {
  // Determine the schema based on the schemaType
  const localUiSchema: RJSFSchema =
    schemaType === "SFO" ? { ...sfoUiSchema } : { ...lfoUiSchema };

  // Return the customized schema.
  return localUiSchema;
};
