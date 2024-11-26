import { actionHandler } from "@bciers/actions";
import { AccessRequest } from "@/administration/app/components/userOperators/types";

export default async function getAccessRequests(): Promise<
  AccessRequest[] | { error: string }
> {
  const response = await actionHandler(
    `registration/v2/user-operators/current/access-requests`,
    "GET",
    "/dashboard/users",
  );
  return response;
}
