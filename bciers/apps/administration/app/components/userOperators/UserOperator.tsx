import { UserOperatorFormData } from "./types";
import UserOperatorReviewForm from "./UserOperatorReviewForm";
import { createOperatorSchema } from "../../data/jsonSchema/operator";
import getUserOperatorFormData from "./getUserOperatorFormData";

export default async function UserOperator({
  params,
}: Readonly<{
  params?: { userOperatorId?: string; readonly?: boolean };
}>) {
  const userOperatorId = params?.userOperatorId;

  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId as string);
  if (!userOperatorData || userOperatorData?.error) {
    throw new Error("Failed to retrieve operator and admin information");
  }
  return (
    <UserOperatorReviewForm
      operatorSchema={await createOperatorSchema()}
      formData={userOperatorData}
      userOperatorId={params.userOperatorId}
    />
  );
}
