import OperationForm from "./OperationForm";
import { actionHandler } from "@bciers/actions";
import { RJSFSchema } from "@rjsf/utils";
import { operationSchema } from "../../data/jsonSchema/operation";

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  businessStructures: { name: string }[],
  naicsCodes: { id: number; naics_code: string; naics_description: string }[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  reportingActivities: {
    // Do we need to display all of these or just some based on type?
    applicable_to: string;
    name: string;
  }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  const section1 = localSchema.properties.section1.properties;
  const section2Dependencies = localSchema.properties.section2.dependencies;
  const section3 = localSchema.properties.section3.properties;

  const businessStructureOptions = businessStructures.map(
    (businessStructure) => ({
      const: businessStructure.name,
      title: businessStructure.name,
    }),
  );

  const naicsCodesFormatted = naicsCodes.map((code) => ({
    const: code?.id,
    title: `${code?.naics_code} - ${code?.naics_description}`,
  }));

  console.log("schema", localSchema);

  // business structures
  if (Array.isArray(businessStructures)) {
    const multipleOperatorsArray =
      section2Dependencies.operation_has_multiple_operators.oneOf[1].properties
        .multiple_operators_array.items;
    multipleOperatorsArray.properties.mo_business_structure.anyOf =
      businessStructureOptions;
    console.log("multipleOperatorsArray", multipleOperatorsArray);
  }

  // naics codes
  if (Array.isArray(naicsCodes)) {
    section1.naics_code_id.anyOf = naicsCodesFormatted;
    section1.secondary_naics_code_id.anyOf = naicsCodesFormatted;
    section1.tertiary_naics_code_id.anyOf = naicsCodesFormatted;
  }
  // regulated products
  if (Array.isArray(regulatedProducts)) {
    section3.regulated_products.items.enum = regulatedProducts.map(
      (product) => product.id,
    );
    section3.regulated_products.items.enumNames = regulatedProducts.map(
      (product) => product.name,
    );
  }
  // reporting activities
  if (Array.isArray(reportingActivities)) {
    // Enum/enumNames are the same due to the available data
    section1.reporting_activities.items.enum = reportingActivities.map(
      (activity) => activity.name,
    );
    section1.reporting_activities.items.enumNames = reportingActivities.map(
      (activity) => activity.name,
    );
  }

  return localSchema;
};

async function getBusinessStructures() {
  try {
    return await actionHandler("registration/business_structures", "GET", "");
  } catch (error) {
    throw error;
  }
}

async function getNaicsCodes() {
  try {
    return await actionHandler("registration/naics_codes", "GET", "");
  } catch (error) {
    throw error;
  }
}

export async function getRegulatedProducts() {
  try {
    return await actionHandler("registration/regulated_products", "GET", "");
  } catch (error) {
    throw error;
  }
}

export async function getReportingActivities() {
  try {
    return await actionHandler("registration/reporting_activities", "GET", "");
  } catch (error) {
    throw error;
  }
}

export const ExternalUserLayout = () => {
  return <h2 className="text-bc-link-blue">Add Operation</h2>;
};

const OperationPage = async () => {
  const businessStructures = await getBusinessStructures();
  const naicsCodes = await getNaicsCodes();
  const regulatedProducts = await getRegulatedProducts();
  const reportingActivities = await getReportingActivities();

  const schema = createOperationSchema(
    operationSchema,
    businessStructures,
    naicsCodes,
    regulatedProducts,
    reportingActivities,
  );

  return <OperationForm schema={schema} />;
};

export default OperationPage;
