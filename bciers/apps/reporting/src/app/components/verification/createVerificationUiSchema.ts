import { RJSFSchema } from "@rjsf/utils";
import { lfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";

export const createVerificationUiSchema = (
  schemaType: "SFO" | "LFO",
): RJSFSchema => {
  // Retrieve a local copy of the base verification ui schema based
  switch (schemaType) {
    case "SFO":
      return { ...sfoUiSchema };
    case "LFO":
      return { ...lfoUiSchema };
  }
};
