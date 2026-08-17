import { actionHandler } from "@bciers/actions";

export default async function getCurrentUserOperatorHasRequiredFields(): Promise<{
  has_required_fields: boolean;
}> {
  return await actionHandler(
    "registration/user-operators/current/has-required-fields",
    "GET",
    "",
  );
}
