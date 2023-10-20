import { fetchAPI } from "@/utils/api";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";
import UserOperatorForm from "@/app/components/form/UserOperatorForm";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

export async function getUserOperatorFormData(id: number) {
  try {
    return await fetchAPI(
      `registration/select-operator/request-access/user-operator/${id}`,
    );
  } catch (e) {
    return null;
  }
}

export default async function UserOperator({
  params,
}: {
  params: { id: number };
}) {
  const formData: UserOperatorFormData = await getUserOperatorFormData(
    params.id,
  );

  return (
    <section className="text-center my-20 text-2xl flex flex-col gap-3">
      <UserOperatorForm
        schema={userOperatorSchema}
        formData={formData}
        userOperatorId={params.id}
      />
    </section>
  );
}
