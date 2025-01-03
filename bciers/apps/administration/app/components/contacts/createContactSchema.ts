import { RJSFSchema } from "@rjsf/utils";
import { UserOperatorUser } from "./types";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

// 🛠️ Function to create a contact schema with updated enum values
export const createContactSchema = (
  schema: RJSFSchema,
  userOperatorUsers: UserOperatorUser[],
  isCreating?: boolean,
) => {
  const localSchema = safeJsonParse(JSON.stringify(schema)); // deep copy

  // For now, we show the `existing_bciers_user` toggle and `selected_user` combobox only when creating a new contact. We should not show `places_assigned` when creating
  if (isCreating) {
    delete localSchema.properties.section1.properties.places_assigned;
    const userOperatorUserOptions = userOperatorUsers.map((user) => ({
      type: "string",
      title: user.full_name,
      enum: [user.id],
      value: user.id,
    }));

    if (
      Array.isArray(userOperatorUserOptions) &&
      userOperatorUserOptions.length > 0
    ) {
      localSchema.properties.section1.allOf[0].then.properties.selected_user.anyOf =
        userOperatorUserOptions;
    }
  } else {
    delete localSchema.properties.section1.properties.existing_bciers_user;
    delete localSchema.properties.section1.allOf;
  }

  return localSchema;
};
