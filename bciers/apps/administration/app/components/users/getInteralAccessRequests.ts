import { actionHandler } from "@bciers/actions";
import { AccessRequest } from "@/administration/app/components/userOperators/types";

interface AccessRequestResponse {
  rows: AccessRequest[];
  row_count: number;
}

export default async function getInternalAccessRequests(): Promise<
  AccessRequestResponse | { error: string }
> {
  const response = await actionHandler(
    `registration/users`,
    "GET",
    "/dashboard/users",
  );
  return {
    rows: response,
    row_count: response.length,
  };
}
