import { actionHandler } from "@bciers/actions";
import { validate as isValidUUID } from "uuid";
import { UserOperatorFormData } from "./types";
import UserOperatorReviewForm from "./UserOperatorReviewForm";
import { createOperatorSchema } from "../../data/jsonSchema/operator";

export async function getUserOperatorFormData(id: string) {
  if (!id || !isValidUUID(id)) return {};
  return actionHandler(
    `registration/user-operators/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}

export default async function UserOperator({
  params,
}: Readonly<{
  params?: { id?: string; readonly?: boolean };
}>) {
  const userOperatorId = params?.id;

  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId as string);

  return (
    <UserOperatorReviewForm
      operatorSchema={await createOperatorSchema()}
      formData={userOperatorData}
    />
  );
}
