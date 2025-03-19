import { actionHandler } from "@bciers/actions";
import { UserOperator } from "@/administration/app/components/userOperators/types";

export default async function getCurrentUserOperator(): Promise<
  UserOperator | { error: string }
> {
  const response = await actionHandler(
    "registration/user-operators/current",
    "GET",
    "",
  );
  return response;
}
