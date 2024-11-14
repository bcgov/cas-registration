import { actionHandler } from "@bciers/actions";
import { UserOperatorsSearchParams } from "@/administration/app/components/userOperators/types";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export default async function getUserOperatorsPageData(
  searchParams: UserOperatorsSearchParams,
) {
  try {
    const queryParams = buildQueryParams(searchParams);
    const pageData = await actionHandler(
      `registration/v2/user-operators${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: pageData.items,
      row_count: pageData.count,
    };
  } catch (error) {
    throw error;
  }
}
