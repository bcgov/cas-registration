import { fetchAPI } from "@/app/utils/api";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";
import UserOperatorForm from "@/app/components/form/UserOperatorForm";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

export async function getUserOperatorFormData(id: number) {
  return fetchAPI(`registration/select-operator/user-operator/${id}`);
}

export default async function UserOperator({
  params,
}: {
  params: Readonly<{ id: number }>;
}) {
  const formData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(params.id);

  if ("error" in formData) {
    return <div>Server Error. Please try again later.</div>;
  }

  return (
    <UserOperatorForm
      schema={userOperatorSchema}
      formData={formData}
      userOperatorId={params.id}
    />
  );
}
