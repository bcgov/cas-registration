import { actionHandler } from "@/app/utils/actions";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";
import UserOperatorForm, {
  UserOperatorFormProps,
} from "@/app/components/form/UserOperatorForm";
import {
  UserFormData,
  UserOperatorFormData,
} from "@/app/components/form/formDataTypes";

export async function getUserOperatorFormData(id: number) {
  return actionHandler(
    `registration/select-operator/user-operator/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}

export async function getUser() {
  return fetchAPI(`registration/user`);
}

export default async function UserOperator({
  params,
}: {
  params?: { id: number };
}) {
  const userOperatorProps: UserOperatorFormProps = {
    schema: userOperatorSchema,
  };

  const serverError = <div>Server Error. Please try again later.</div>;

  if (params) {
    // if params exist, then we are editing an existing userOperator
    const formData: UserOperatorFormData = await getUserOperatorFormData(
      params.id,
    );
    userOperatorProps.formData = formData;
    userOperatorProps.userOperatorId = params.id;
  } else {
    // if params do not exist, then we are creating a new userOperator
    const formData: UserFormData = await getUser();
    userOperatorProps.formData = formData;
  }

  if (userOperatorProps.formData && "error" in userOperatorProps.formData)
    return serverError;

  return <UserOperatorForm {...userOperatorProps} />;
}
