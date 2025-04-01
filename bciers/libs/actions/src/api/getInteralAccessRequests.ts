import { actionHandler } from "@bciers/actions";
import { InternalAccessRequest } from "@/administration/app/components/users/types";

async function getInternalAccessRequests(): Promise<
  InternalAccessRequest[] | { error: string }
> {
  const response = await actionHandler(
    `registration/users`,
    "GET",
    "/dashboard/users",
  );
  return response;
}
export default getInternalAccessRequests;
