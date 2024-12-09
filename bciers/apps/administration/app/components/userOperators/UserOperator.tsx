import { actionHandler } from "@bciers/actions";
import { RJSFSchema } from "@rjsf/utils";
import { auth } from "@/dashboard/auth";
import { validate as isValidUUID } from "uuid";
import { BusinessStructure, UserOperatorFormData } from "./types";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import UserOperatorReviewForm from "./UserOperatorReviewForm";
import {
  createUserOperatorInternalUserSchema,
  userOperatorInternalUserSchema,
} from "@/administration/app/data/jsonSchema/userOperator";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";
console.log("in adminisration UserOperator component");
async function getBusinessStructures() {
  return actionHandler(
    `registration/business_structures`,
    "GET",
    `/dashboard/select-operator/user-operator`,
  );
}

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
  const session = await auth();
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  const serverError = <div>Server Error. Please try again later.</div>;
  const userOperatorId = params?.id;
  const businessStructures: BusinessStructure[] | { error: string } =
    await getBusinessStructures();

  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId as string);

  if ("error" in businessStructures || "error" in userOperatorData)
    return serverError;

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );

  const formData = {
    ...userOperatorData,
  };

  return (
    <>
      <UserOperatorReviewForm
        schema={await createUserOperatorInternalUserSchema()}
        formData={formData}
      />
    </>
  );
}
