import OperationsForm, {
  OperationsFormData,
} from "@/app/components/form/OperationsForm";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";
import { fetchAPI } from "@/app/utils/api";

// 🛠️ Function to fetch NAICS codes
async function getNaicsCodes() {
  try {
    return await fetchAPI("registration/naics_codes");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
export async function getNaicsCategories() {
  try {
    return await fetchAPI("registration/naics_categories");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🛠️ Function to fetch an operation by ID
async function getOperation(id: number) {
  try {
    return await fetchAPI(`registration/operations/${id}`);
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number }[],
  naicsCategories: { id: number }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  // naics codes
  if (Array.isArray(naicsCodes)) {
    localSchema.properties.naics_code_id.enum = naicsCodes.map(
      (code) => code.id,
    );
  }
  // naics categories
  if (Array.isArray(naicsCategories)) {
    localSchema.properties.naics_category_id.enum = naicsCategories.map(
      (category) => category.id,
    );
  }
  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  const codes = await getNaicsCodes();
  const categories = await getNaicsCategories();
  let operation: any;

  if (numRow) {
    operation = await getOperation(numRow);
  }
  // Render the OperationsForm component with schema and formData?
  return (
    <>
      <OperationsForm
        schema={createOperationSchema(operationSchema, codes, categories)}
        formData={operation as OperationsFormData}
      />
    </>
  );
}
