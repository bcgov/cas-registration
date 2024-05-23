import { actionHandler } from "@/app/utils/actions";

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  searchParams: OperationsSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);

    // fetch data from server
    const pageData = await actionHandler(
      `registration/operations${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: formatOperationRows(pageData.data),
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
};

async function getOperators() {
  try {
    return await actionHandler("registration/operations", "GET");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export default async function Operators() {
  const operators = await getOperators();

  return <p>{JSON.stringify(operators.data, null, 2)}</p>;
}
