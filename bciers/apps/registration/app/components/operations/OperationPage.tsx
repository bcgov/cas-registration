import OperationForm from "./OperationForm";
import Note from "@bciers/components/layout/Note";
import { actionHandler } from "@bciers/utils/actions";
import { RJSFSchema } from "@rjsf/utils";
import { operationSchema } from "./operation";

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number; naics_code: string; naics_description: string }[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  reportingActivities: {
    id: number;
    name: string;
  }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  const section1 = localSchema.properties.section1.properties;
  const section3 = localSchema.properties.section3.properties;

  const naicsCodesFormatted = naicsCodes.map((code) => ({
    const: code?.id,
    title: `${code?.naics_code} - ${code?.naics_description}`,
  }));
  const regulatedProductsFormatted = regulatedProducts.map((product) => ({
    const: product?.id,
    title: product?.name,
  }));
  // const reportingActivitiesFormatted = reportingActivities.map((activity) => ({
  //   const: activity?.id,
  //   title: activity?.name,
  // }));
  // naics codes
  if (Array.isArray(naicsCodes)) {
    section1.primary_naics_code_id.anyOf = naicsCodesFormatted;
    section1.secondary_naics_code_id.anyOf = naicsCodesFormatted;
    section1.tertiary_naics_code_id.anyOf = naicsCodesFormatted;
  }
  // regulated products
  if (Array.isArray(regulatedProducts)) {
    section3.regulated_products.anyOf = regulatedProductsFormatted;
  }
  // reporting activities
  // if (Array.isArray(reportingActivities)) {
  //   section1.reporting_activities.anyOf = reportingActivitiesFormatted;
  // }

  return localSchema;
};

async function getNaicsCodes() {
  try {
    return await actionHandler(
      "registration/naics_codes",
      "GET",
      "/dashboard/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export async function getRegulatedProducts() {
  try {
    return await actionHandler(
      "registration/regulated_products",
      "GET",
      "/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export async function getReportingActivities() {
  try {
    return await actionHandler(
      "registration/reporting_activities",
      "GET",
      "/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export const ExternalUserLayout = () => {
  return <h2 className="text-bc-link-blue">Add Operation</h2>;
};

const OperationPage = async () => {
  const naicsCodes = await getNaicsCodes();
  const regulatedProducts = await getRegulatedProducts();
  const reportingActivities = await getReportingActivities();

  const schema = createOperationSchema(
    operationSchema,
    naicsCodes,
    regulatedProducts,
    reportingActivities,
  );

  return <OperationForm schema={schema} />;
};

export default OperationPage;
