import { RJSFSchema } from "@rjsf/utils";
import { lfoSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationSchema = (
  facilities: string[],
  schemaType: "SFO" | "LFO",
): RJSFSchema => {
  // Determine the schema based on the schemaType
  const localSchema: RJSFSchema =
    schemaType === "SFO" ? { ...sfoSchema } : { ...lfoSchema };

  // Dynamically populate the "visit_names" field's enum with the facilities
  switch (schemaType) {
    case "SFO":
      (localSchema.properties?.visit_names as any).enum = [
        ...facilities,
        "Other",
        "None",
      ];
      break;
    case "LFO":
      (localSchema.properties?.visit_names as any).items.enum = [
        ...facilities,
        "Other",
        "None",
      ];
      break;
  }

  // Return the customized schema.
  return localSchema;
};
