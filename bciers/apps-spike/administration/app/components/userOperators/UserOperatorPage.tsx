import { UserOperatorFormData } from "@/administration/app/components/userOperators/types";
import UserOperatorReviewForm from "@/administration/app/components/userOperators/UserOperatorReviewForm";
import { createOperatorSchema } from "@/administration/app/data/jsonSchema/operator";
import getUserOperatorFormData from "@/administration/app/components/userOperators/getUserOperatorFormData";
import { UUID } from "crypto";

const UserOperatorPage = async ({
  userOperatorId,
}: {
  userOperatorId: UUID;
}) => {
  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId as string);
  if (!userOperatorData || "error" in userOperatorData) {
    throw new Error("Failed to retrieve operator and admin information");
  }
  return (
    <UserOperatorReviewForm
      operatorSchema={await createOperatorSchema()}
      formData={userOperatorData}
      userOperatorId={userOperatorId}
    />
  );
};

export default UserOperatorPage;
