import { actionHandler } from "@/app/utils/actions";
import {
  userOperatorSchema,
  userOperatorPage2,
} from "@/app/utils/jsonSchema/userOperator";
import UserOperatorMultiStepForm from "@/app/components/form/UserOperatorMultiStepForm";
import { BusinessStructure } from "@/app/components/routes/select-operator/form/types";
import { RJSFSchema } from "@rjsf/utils";
import { UserInformationInitialFormData } from "@/app/components/form/formDataTypes";
import UserOperatorForm from "@/app/components/form/UserOperatorForm";

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

export async function getUserOperatorFormData(id: number) {
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
  params?: { id?: number };
}>) {
  const serverError = <div>Server Error. Please try again later.</div>;
  const businessStructures: BusinessStructure[] | { error: string } =
    await getBusinessStructures();

  const userData: UserInformationInitialFormData | { error: string } =
    await getCurrentUser();

  // TODO: define schema of data returned from endpoint
  const userOperatorData: any | { error: string } =
    await getUserOperatorFormData(params.id);

  const serverError = <div>Server Error. Please try again later.</div>;

  if (
    "error" in userData ||
    "error" in businessStructures ||
    "error" in userOperatorData
  )
    return serverError;

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );

  // If operator has an admin, use the single page form to show the user information
  return params?.id ? (
    <UserOperatorForm schema={userOperatorPage2} formData={userData} />
  ) : (
    <Review userOperator={userOperatorData} userOperatorId={params.id} />
    <UserOperatorMultiStepForm
      schema={createUserOperatorSchema(businessStructuresList)}
      formData={userData}
    />
  console.log(userOperatorData);
  console.log(createUserOperatorSchema(businessStructuresList));
  );
}
