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
  naicsCodes: { id: number }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  // naics codes
  if (Array.isArray(naicsCodes)) {
    // add to nested operation page1 schema
    localSchema.properties.operationPage1.properties.naics_code_id.enum =
      naicsCodes.map((code) => code.id);
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
  // Render the OperationsForm component with schema and formData if the operation already exists
  return (
    <>
      {operation?.status === Status.PENDING ? (
        <Review operation={operation} />
      ) : null}
      <OperationsForm
        schema={createOperationSchema(operationSchema, codes)}
        formData={operation as OperationsFormData}
      />
    </>
  );
}
