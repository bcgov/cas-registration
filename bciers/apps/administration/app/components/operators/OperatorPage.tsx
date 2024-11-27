import OperatorForm from "./OperatorForm";
import { operatorSchema } from "../../data/jsonSchema/operator";
import { RJSFSchema } from "@rjsf/utils";
import getCurrentOperator from "./getCurrentOperator";
import getBusinessStructures from "./getBusinessStructures";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { auth } from "@/dashboard/auth";
import getOperator from "./getOperator";
import { UUID } from "crypto";

export const createOperatorSchema = (
  schema: RJSFSchema,
  businessStructures: { name: string }[],
): RJSFSchema => {
  const localSchema = safeJsonParse(JSON.stringify(schema));

  const businessStructureOptions = businessStructures?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.name,
      enum: [businessStructure.name],
      value: businessStructure.name,
    }),
  );

  // add business structure options for operator
  localSchema.properties.section1.properties.business_structure = {
    ...localSchema.properties.section1.properties.business_structure,
    anyOf: businessStructureOptions,
  };

  // add business structure options for partner operators
  const partnerOperatorsArray = {
    type: "array",
    default: [{}],
    items: {
      type: "object",
      required: [
        "partner_legal_name",
        "partner_business_structure",
        "partner_cra_business_number",
        "partner_bc_corporate_registry_number",
      ],
      properties: {
        partner_legal_name: { type: "string", title: "Legal Name" },
        partner_trade_name: { type: "string", title: "Trade Name" },
        partner_business_structure: {
          type: "string",
          title: "Business Structure",
          anyOf: businessStructureOptions,
        },
        partner_cra_business_number: {
          type: "number",
          title: "CRA Business Number",
          minimum: 100000000,
          maximum: 999999999,
        },
        partner_bc_corporate_registry_number: {
          type: "string",
          title: "BC Corporate Registry Number",
          format: "bc_corporate_registry_number",
        },
      },
    },
  };

  // create dependencies for business structure
  const oneOfOptions = [];
  for (const el of businessStructures) {
    const obj = {
      properties: {
        business_structure: {
          const: el.name,
        },
        ...(el.name.includes("Partnership") && {
          partner_operators_array: partnerOperatorsArray,
        }),
      },
    };
    oneOfOptions.push(obj);
  }
  localSchema.properties.section1.dependencies.business_structure.oneOf =
    oneOfOptions;

  return localSchema;
};

// 🧩 Main component
export default async function OperatorPage({
  isCreating = false,
  operatorId,
}: { isCreating?: boolean; operatorId?: UUID } = {}) {
  const session = await auth();

  const role = session?.user?.app_role;

  let operatorFormData: { [key: string]: any } | { error: string } = {};

  if (!isCreating) {
    // operatorId is only passed in for internal users. External users only have access to their own operator
    if (operatorId && role.includes("cas_")) {
      operatorFormData = await getOperator(operatorId);
    } else {
      operatorFormData = await getCurrentOperator();
    }
    if (!operatorFormData || operatorFormData?.error) {
      throw new Error("Failed to retrieve operator information");
    }
  }
  const businessStructures: { name: string }[] | { error: string } =
    await getBusinessStructures();
  if ("error" in businessStructures) {
    throw new Error("Failed to retrieve business structure information");
  }

  return (
    <OperatorForm
      schema={createOperatorSchema(operatorSchema, businessStructures)}
      formData={operatorFormData}
      isCreating={isCreating}
      isInternalUser={role.includes("cas_")}
    />
  );
}
