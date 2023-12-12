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
import Review from "../../access-requests/form/Review";

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
  params?: { id?: number; readonly?: boolean };
}>) {
  const businessStructures: BusinessStructure[] | { error: string } =
    await getBusinessStructures();

  const userData: UserInformationInitialFormData | { error: string } =
    await getCurrentUser();

  // TODO: define schema of data returned from endpoint
  const userOperatorData: any | { error: string } =
    await getUserOperatorFormData(params.id);

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

  // FIXME: this data is bogus. Replace with genuine data.
  userOperatorData.is_senior_officer = "true";
  userOperatorData.operator_has_parent_company = "no";
  console.log(userOperatorData);

  // If operator has an admin, use the single page form to show the user information
  // TODO: is there a better/smarter way to distinguish between what form component should be displayed?
  return params?.id ? (
    // for internal users reviewing prime admin access requests
    <>
      <Review userOperator={userOperatorData} userOperatorId={params.id} />
      <UserOperatorForm schema={userOperatorPage2} formData={userData} />
    </>
  ) : (
    // for external users requesting prime admin access
    <UserOperatorMultiStepForm
      schema={createUserOperatorSchema(businessStructuresList)}
      formData={userData}
    />
  );
}
