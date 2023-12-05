import OperationsForm, {
  OperationsFormData,
} from "@/app/components/form/OperationsForm";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";
// import { actionHandler } from "@/app/utils/api";
import { actionHandler } from "@/app/utils/actions";
import Review from "./Review";
import { Status } from "@/app/types/types";

// 🛠️ Function to fetch NAICS codes
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

// 🛠️ Function to fetch an operation by ID
async function getOperation(id: number) {
  try {
    return await actionHandler(
      `registration/operations/${id}`,
      "GET",
      `/operations/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number; naics_code: string }[],
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
  // naics codes
  if (Array.isArray(naicsCodes)) {
    // add to nested operation page1 schema
    localSchema.properties.operationPage1.properties.naics_code_id.anyOf =
      naicsCodes.map((code) => {
        return { const: code?.id, title: code?.naics_code };
      });
  }
  // regulated products
  if (Array.isArray(regulatedProducts)) {
    localSchema.properties.operationPage1.properties.regulated_products.items.enum =
      regulatedProducts.map((product) => product?.id);

    localSchema.properties.operationPage1.properties.regulated_products.items.enumNames =
      regulatedProducts.map((product) => product?.name);
  }
  // reporting activities
  if (Array.isArray(reportingActivities)) {
    localSchema.properties.operationPage1.properties.reporting_activities.items.enum =
      reportingActivities.map((activity) => activity?.id);

    localSchema.properties.operationPage1.properties.reporting_activities.items.enumNames =
      reportingActivities.map((activity) => activity?.name);
  }
  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  const codes = await getNaicsCodes();
  const products = await getRegulatedProducts();
  const activities = await getReportingActivities();

  let operation: any;

  if (numRow) {
    operation = await getOperation(numRow);
  }
  // Render the OperationsForm component with schema and formData if the operation already exists
  return (
    <>
      {operation?.status === Status.PENDING ? (
        <Review operation={operation} />
      ) : null}
      <OperationsForm
        schema={createOperationSchema(
          operationSchema,
          codes,
          products,
          activities,
        )}
        formData={operation as OperationsFormData}
      />
    </>
  );
}
