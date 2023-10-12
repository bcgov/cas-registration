import OperationsForm, {
  OperationsFormData,
} from "@/components/form/OperationsForm";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";
import { fetchAPI } from "@/utils/api";
// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

// 🛠️ Functions to fetch NAICS codes and categories
export async function getNaicsCodes() {
  return (
    await fetch("http://localhost:8000/api/registration/naics_codes", {
      cache: "no-store",
    })
  ).json();
}
export async function getNaicsCateogories() {
  return (
    await fetch("http://localhost:8000/api/registration/naics_categories", {
      cache: "no-store",
    })
  ).json();
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
  naicsCategories: { id: number }[]
) => {
  // naics codes
  const localSchema = JSON.parse(JSON.stringify(schema));
  localSchema.properties.naics_code_id.enum = naicsCodes?.map(
    (code) => code.id
  );
  // naics categories
  localSchema.properties.naics_category_id.enum = naicsCategories?.map(
    (category) => category.id
  );
  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  const codes = await getNaicsCodes();
  const categories = await getNaicsCateogories();
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
