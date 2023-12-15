import { actionHandler } from "@/app/utils/actions";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";

import { BusinessStructure } from "@/app/components/routes/select-operator/form/types";
import { RJSFSchema } from "@rjsf/utils";
import {
  UserInformationInitialFormData,
  UserOperatorFormData,
} from "@/app/components/form/formDataTypes";
import UserOperatorMultiStepForm from "@/app/components/form/UserOperatorMultiStepForm";

async function getCurrentUser() {
  return actionHandler(
    `registration/user`,
    "GET",
    `/dashboard/select-operator/user-operator`,
  );
}

async function getBusinessStructures() {
  return actionHandler(
    `registration/business_structures`,
    "GET",
    `/dashboard/select-operator/user-operator`,
  );
}

export async function getUserOperatorFormData(id: number | undefined) {
  if (!id) return {};
  return actionHandler(
    `registration/select-operator/user-operator/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}

// To populate the options for the business structure select field
const createUserOperatorSchema = (
  businessStructureList: { id: string; label: string }[],
): RJSFSchema => {
  const localSchema = JSON.parse(JSON.stringify(userOperatorSchema));

  const businessStructureOptions = businessStructureList?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.label,
      enum: [businessStructure.id],
      value: businessStructure.id,
    }),
  );

  // for operator
  localSchema.properties.userOperatorPage1.properties.business_structure = {
    ...localSchema.properties.userOperatorPage1.properties.business_structure,
    anyOf: businessStructureOptions,
  };

  // for parent company
  localSchema.properties.userOperatorPage1.allOf[0].then.properties.pc_business_structure =
    {
      ...localSchema.properties.userOperatorPage1.allOf[0].then.properties
        .pc_business_structure,
      anyOf: businessStructureOptions,
    };

  return localSchema;
};

export default async function UserOperator({
  params,
}: Readonly<{
  params?: { id?: number; readonly?: boolean };
}>) {
  const userOperatorId = params?.id;
  const businessStructures: BusinessStructure[] | { error: string } =
    await getBusinessStructures();

  const userData: UserInformationInitialFormData | { error: string } =
    await getCurrentUser();

  const userOperatorData: UserOperatorFormData | { error: string } =
    await getUserOperatorFormData(userOperatorId);

  if (
    "error" in userData ||
    "error" in businessStructures ||
    "error" in userOperatorData
  )
    return;

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );
  return (
    <UserOperatorMultiStepForm
      schema={createUserOperatorSchema(businessStructuresList)}
      formData={userOperatorData}
    />
  );
}
