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

  if ("error" in userData || "error" in businessStructures) return serverError;

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );
  // can make schema conditional on params.id
  console.log("userData", userData);
  // If operator has an admin, use the single page form to show the user information
  return params?.id ? (
    // for industry users when the operator already exists, cas users would never need to see this
    <UserOperatorForm schema={userOperatorPage2} formData={userData} />
  ) : (
    // we don't actually have a readonly version displayed anywhere until the Joshs' PRs are in

    <UserOperatorMultiStepForm
      schema={createUserOperatorSchema(businessStructuresList)}
      // need to pass useroperator info here too, fetch it above like we're doing with the userDataa
      formData={userData}
    />
  );
}
