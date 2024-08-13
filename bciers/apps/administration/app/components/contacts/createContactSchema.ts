import { contactsSchema } from "./../../data/jsonSchema/contact";
import { UserOperatorUser } from "./types";
import safeJsonParse from "libs/utils/safeJsonParse";

// 🛠️ Function to create a contact schema with updated enum values
export const createContactSchema = (
  userOperatorUsers: UserOperatorUser[],
  isCreating?: boolean,
) => {
  const localSchema = safeJsonParse(JSON.stringify(contactsSchema)); // deep copy

  // For now, we show the `existing_bciers_user` toggle and `selected_user` combobox only when creating a new contact
  if (isCreating) {
    const userOperatorUserOptions = userOperatorUsers?.map((user) => ({
      type: "string",
      title: user.full_name,
      enum: [user.id],
      value: user.id,
    }));

    if (Array.isArray(userOperatorUserOptions)) {
      localSchema.properties.section1.allOf[0].then.properties.selected_user.anyOf =
        userOperatorUserOptions;
    }
  } else {
    delete localSchema.properties.section1.properties.existing_bciers_user;
    delete localSchema.properties.section1.allOf;
  }

  return localSchema;
};
