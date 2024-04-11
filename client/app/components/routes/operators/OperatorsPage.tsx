import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";
import { actionHandler } from "@/app/utils/actions";
import { OperatorsSearchParams } from "@/app/components/routes/access-requests/types";
import { GridRowsProp } from "@mui/x-data-grid";

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
    }
  );
};

// 🛠️ Function to fetch user-operators
export const fetchUserOperatorPageData = async (
  page: number,
  sortField?: string,
  sortOrder?: string
) => {
  try {
    // fetch data from server
    const pageData = await actionHandler(
      `registration/user-operator/user-operator-initial-requests?page=${page}&sort_field=${sortField}&sort_order=${sortOrder}`,
      "GET",
      ""
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
  const sortField = searchParams?.sort_field ?? "created_at";
  const sortOrder = searchParams?.sort_order ?? "desc";
  // Fetch userOperator data
  const initialData = await fetchUserOperatorPageData(1, sortField, sortOrder);

  return (
    <Suspense fallback={<Loading />}>
      <AccessRequests initialData={initialData} />
    </Suspense>
  );
};

export default OperatorsPage;
