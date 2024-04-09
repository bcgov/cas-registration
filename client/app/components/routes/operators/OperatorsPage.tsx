import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";
import { actionHandler } from "@/app/utils/actions";
import { UserOperatorPaginated } from "@/app/components/routes/access-requests/types";

// 🛠️ Function to fetch user-operators
async function getUserOperators() {
  try {
    return await actionHandler(
      "registration/user_operator/user-operator-initial-requests",
      "GET",
      "/dashboard/operators",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

const OperatorsPage = async () => {
  // Fetch userOperator data
  const userOperators: UserOperatorPaginated = await getUserOperators();

  return (
    <Suspense fallback={<Loading />}>
      <AccessRequests userOperators={userOperators} />
    </Suspense>
  );
};

export default OperatorsPage;
