import OperationsForm from "@/app/components/Form/operationsForm";
import { operationSchema } from "@/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";

export async function getNaicsCodes() {
  return (
    await fetch("http://localhost:8000/api/registration/naics_codes", {
      cache: "no-store",
    })
  ).json();
}

export const createOperationSchema = (schema: RJSFSchema, naicsCodes) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  localSchema.properties.naics_code.enum = naicsCodes?.map((code) => code.id);
  return localSchema;
};

export default async function Page() {
  const codes = await getNaicsCodes();
  return (
    <OperationsForm schema={createOperationSchema(operationSchema, codes)} />
  );
}
