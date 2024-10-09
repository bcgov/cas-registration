import { actionHandler } from "@bciers/actions";
import { AccessRequest } from "@/administration/app/components/userOperators/types";

export default async function getAccessRequests(): Promise<
  AccessRequest[] | { error: string }
> {
  try {
    return await actionHandler(
      `registration/user-operators/current/access-requests`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}
