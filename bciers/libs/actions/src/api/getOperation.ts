import { actionHandler } from "@bciers/actions";

async function getOperation(id: string) {
  const response = await actionHandler(
    `registration/operations/${id}`,
    "GET",
    "",
  );
  return response;
}

export default getOperation;
