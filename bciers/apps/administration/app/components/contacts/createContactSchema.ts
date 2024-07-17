import { contactsSchema } from "./../../data/jsonSchema/contact";
import { UserOperatorUser } from "./types";

// 🛠️ Function to create a contact schema with updated enum values
export const createContactSchema = (userOperatorUsers: UserOperatorUser[]) => {
  const localSchema = JSON.parse(JSON.stringify(contactsSchema)); // deep copy
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

  return localSchema;
};
