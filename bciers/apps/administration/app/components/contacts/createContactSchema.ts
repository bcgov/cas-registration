import { RJSFSchema } from "@rjsf/utils";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

// 🛠️ Function to create a contact schema with updated enum values
export const createContactSchema = (
  schema: RJSFSchema,
  isCreating?: boolean,
) => {
  const localSchema = safeJsonParse(JSON.stringify(schema)); // deep copy

  // We should not show `places_assigned` when creating
  if (isCreating) {
    delete localSchema.properties.places_assigned;
  }

  return localSchema;
};
