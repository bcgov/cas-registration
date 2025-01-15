import { RJSFSchema } from "@rjsf/utils";
import { verificationUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationUiSchema = (
  schemaType: "SFO" | "LFO",
): RJSFSchema => {
  // Retrieve a local copy of the base verification ui schema based
  const localSchema = { ...verificationUiSchema } as Record<string, any>;
  switch (schemaType) {
    case "SFO":
      break;
    case "LFO":
      // Add a new configuration for `visit_names`
      delete localSchema.visit_names;
      localSchema.visit_names = {
        "ui:widget": "MultiSelectWidget",
        "ui:placeholder": "Select sites visited",
      };
      break;
  }

  // Return the customized schema.
  return localSchema;
};
