import { actionHandler } from "@/app/utils/actions";
import {
  userOperatorPage2,
  userOperatorSchema,
} from "@/app/utils/jsonSchema/userOperator";

import { BusinessStructure } from "@/app/components/routes/select-operator/form/types";
import { RJSFSchema } from "@rjsf/utils";
import {
  UserInformationInitialFormData,
  UserOperatorFormData,
} from "@/app/components/form/formDataTypes";
import UserOperatorMultiStepForm from "@/app/components/form/UserOperatorMultiStepForm";
import UserOperatorContactForm from "@/app/components/form/UserOperatorContactForm";

async function getCurrentUser() {
  return actionHandler(
    `registration/user`,
    "GET",
    `/dashboard/select-operator/user-operator`
  );
}

async function getBusinessStructures() {
  return actionHandler(
    `registration/business_structures`,
    "GET",
    `/dashboard/select-operator/user-operator`
  );
}

export async function getUserOperatorFormData(id: number | string) {
  if (!id || isNaN(Number(id))) return {};
  return actionHandler(
    `registration/select-operator/user-operator/${id}`,
    "GET",
    `/user-operator/${id}`
  );
}

// To populate the options for the business structure select field
const createUserOperatorSchema = (
  businessStructureList: { id: string; label: string }[]
): RJSFSchema => {
  const localSchema = JSON.parse(JSON.stringify(userOperatorSchema));

  const businessStructureOptions = businessStructureList?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.label,
      enum: [businessStructure.id],
      value: businessStructure.id,
    })
  );

  // for operator
  localSchema.properties.userOperatorPage1.properties.business_structure = {
    ...localSchema.properties.userOperatorPage1.properties.business_structure,
    anyOf: businessStructureOptions,
  };

  // for parent company
  localSchema.properties.userOperatorPage1.allOf[0].then.properties.parent_operators_array.items.properties.po_business_structure.anyOf =
    businessStructureOptions;

  return localSchema;
};

export default async function UserOperator({
  params,
}: Readonly<{
  params?: { id?: number | string; readonly?: boolean };
}>) {
  const serverError = <div>Server Error. Please try again later.</div>;
  const userOperatorId = params?.id;
  const businessStructures: BusinessStructure[] | { error: string } =
    await getBusinessStructures();

  const userData: UserInformationInitialFormData | { error: string } =
    await getCurrentUser();

  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId as string | number);

  if (
    "error" in userData ||
    "error" in businessStructures ||
    "error" in userOperatorData
  )
    return serverError;

  // const currentUserAppRole = userData.app_role.role_name;
  // const isCasInternal =
  //   currentUserAppRole?.includes("cas") &&
  //   !currentUserAppRole?.includes("pending");

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    })
  );

  const formData = {
    // We need to only pass the email and phone number to the user information page
    ...{ email: userData?.email, phone_number: userData?.phone_number },
    ...userOperatorData,
  };

  return params?.id === "request-access" ? (
    // If the operator exists then show the form from the second page
    <UserOperatorContactForm formData={formData} schema={userOperatorPage2} />
  ) : (
    <UserOperatorMultiStepForm
      schema={createUserOperatorSchema(businessStructuresList)}
      formData={formData}
    />
  );
}
