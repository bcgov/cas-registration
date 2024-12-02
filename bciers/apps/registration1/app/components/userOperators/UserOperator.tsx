import { actionHandler } from "@bciers/actions";
import {
  userOperatorSchema,
  userOperatorInternalUserSchema,
} from "@/app/utils/jsonSchema/userOperator";

import { RJSFSchema } from "@rjsf/utils";
import { auth } from "@/dashboard/auth";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { validate as isValidUUID } from "uuid";
import { BusinessStructure } from "./types";
import UserOperatorReviewForm from "./UserOperatorReviewForm";
import UserOperatorForm from "./UserOperatorForm";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

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
    `registration/v1/user-operators/${id}`,
    "GET",
    `/user-operator/${id}`,
  );
}

// To populate the options for the business structure select field
const createUserOperatorSchema = (
  schema: RJSFSchema,
  businessStructureList: { id: string; label: string }[],
): RJSFSchema => {
  const localSchema = safeJsonParse(JSON.stringify(schema));

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
  localSchema.properties.userOperatorPage1.allOf[0].then.properties.parent_operators_array.items.properties.po_business_structure.anyOf =
    businessStructureOptions;

  return localSchema;
};

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

  // Render the review form if the user is CAS internal
  if (isCasInternal) {
    return (
      <UserOperatorReviewForm
        schema={createUserOperatorSchema(
          userOperatorInternalUserSchema,
          businessStructuresList,
        )}
        formData={formData}
      />
    );
  }

  return (
    <UserOperatorForm
      schema={createUserOperatorSchema(
        userOperatorSchema,
        businessStructuresList,
      )}
      formData={formData}
    />
  );
}
