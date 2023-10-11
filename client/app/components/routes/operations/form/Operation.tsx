import OperationsForm, {
  OperationsFormData,
} from "@/components/form/OperationsForm";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";
import { fetchAPI } from "@/utils/api";
// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

// 🛠️ Function to fetch NAICS codes
async function getNaicsCodes() {
  try {
    return await fetchAPI("registration/naics_codes");
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
const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number }[] | undefined,
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));

  if (Array.isArray(naicsCodes)) {
    localSchema.properties.naics_code_id.enum = naicsCodes.map(
      (code) => code.id,
    );
  }

  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  const codes = await getNaicsCodes();
  let operation: any;

  if (numRow) {
    operation = await getOperation(numRow);
  }

  // Render the OperationsForm component with schema and formData?
  return (
    <>
      <OperationsForm
        schema={createOperationSchema(operationSchema, codes)}
        formData={operation as OperationsFormData}
      />
    </>
  );
}
