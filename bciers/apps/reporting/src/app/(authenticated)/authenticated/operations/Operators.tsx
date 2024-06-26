import { actionHandler } from "@bciers/actions";

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
