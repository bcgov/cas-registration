import { actionHandler } from "@bciers/actions";
import { validate as isValidUUID } from "uuid";
export default async function getUserOperatorFormData(id: string) {
  if (!id || !isValidUUID(id)) return {};
  return actionHandler(
    `registration/user-operators/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}
