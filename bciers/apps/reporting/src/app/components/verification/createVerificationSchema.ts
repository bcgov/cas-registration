import { RJSFSchema } from "@rjsf/utils";
import { verificationSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationSchema = (facilities: string[]): RJSFSchema => {
  // Retrieve a local copy of the base verification schema based
  const localSchema = { ...verificationSchema };

  // Dynamically populate the "visited_facilities" field's enum with the facilities
  (localSchema.properties?.visit_name as any).enum = [
    ...facilities,
    "Other",
    "None",
  ];

  // Return the customized schema.
  return localSchema;
};
