import { actionHandler } from "@/app/utils/actions";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";
import UserOperatorForm from "@/app/components/form/UserOperatorForm";
import Review from "@/app/components/routes/access-requests/form/Review";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

export async function getUserOperatorFormData(id: number) {
  return actionHandler(
    `registration/select-operator/user-operator/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}

export default async function UserOperator({
  params,
}: {
  params: { id: number };
}) {
  const formData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(params.id);

  if ("error" in formData) {
    return <div>Server Error. Please try again later.</div>;
  }

  return (
    <>
      <Review userOperator={formData} userOperatorId={params.id} />
      <UserOperatorForm
        schema={userOperatorSchema}
        formData={formData}
        userOperatorId={params.id}
      />
    </>
  );
}
