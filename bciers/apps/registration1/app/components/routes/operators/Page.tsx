import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { actionHandler } from "@bciers/actions";
import { GridRowsProp } from "@mui/x-data-grid";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { OperatorsSearchParams } from "@/app/components/userOperators/types";
import AccessRequests from "@/app/components/userOperators/AccessRequests";

export const formatUserOperatorRows = (rows: GridRowsProp) => {
  return rows?.map(
    ({
      id,
      user_friendly_id,
      status,
      first_name,
      last_name,
      email,
      legal_name,
      bceid_business_name,
    }) => {
      return {
        id, // This unique ID is needed for DataGrid to work properly
        user_friendly_id,
        status,
        first_name,
        last_name,
        email,
        legal_name,
        bceid_business_name,
      };
    },
  );
};

// 🛠️ Function to fetch user-operators
export const fetchUserOperatorPageData = async (
  params: OperatorsSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(params);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/v1/user-operators${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: formatUserOperatorRows(pageData.data),
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
};

const OperatorsPage = async ({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) => {
  // Fetch userOperator data
  const initialData = await fetchUserOperatorPageData(searchParams);

  return (
    <Suspense fallback={<Loading />}>
      <AccessRequests initialData={initialData} />
    </Suspense>
  );
};

export default OperatorsPage;
