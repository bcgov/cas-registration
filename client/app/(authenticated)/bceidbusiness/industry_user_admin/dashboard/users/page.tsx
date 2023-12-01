import { actionHandler } from "@/app/utils/actions";

// 🛠️ Function to fetch userOperators
async function getUserOperatorsForOperator() {
  try {
    return await actionHandler(
      "registration/operators/2/user-operators",
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}

export default async function Page() {
  const raw = await getUserOperatorsForOperator();

  return (
    <>
      <h1>TO DO: Users Page</h1>
      <pre>{JSON.stringify(raw, null, 2)}</pre>
    </>
  );
}
