import { RJSFSchema } from "@rjsf/utils";
import { verificationSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationSchema = (
  facilities: string[],
  schemaType: "SFO" | "LFO",
): RJSFSchema => {
  // Retrieve a local copy of the base verification schema based
  const localSchema = { ...verificationSchema };

  switch (schemaType) {
    case "SFO":
      // Dynamically populate the "visited_facilities" field's enum with the facilities
      (localSchema.properties?.visit_names as any).enum = [
        ...facilities,
        "Other",
        "None",
      ];
      break;
    case "LFO":
      // Ensure properties exist before modifying
      localSchema.properties = localSchema.properties ?? {};

      // Remove old visit_names if they exist
      delete localSchema.properties.visit_names;
      if (localSchema.dependencies) {
        delete localSchema.dependencies.visit_names;
      }

      // Add the new visit_names property
      localSchema.properties.visit_names = {
        type: "array",
        title: "Sites visited",
        items: {
          type: "string",
          enum: Array.isArray(facilities)
            ? [...facilities, "Other", "None"]
            : ["Other", "None"],
        },
        uniqueItems: true,
      };

      break;
  }

  // Return the customized schema.
  return localSchema;
};
