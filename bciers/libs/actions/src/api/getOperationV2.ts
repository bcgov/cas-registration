import { actionHandler } from "@bciers/actions";

async function getOperationV2(id: string) {
  const response = await actionHandler(
    `registration/v2/operations/${id}`,
    "GET",
    "",
  );
  return response;
}

export default getOperationV2;
