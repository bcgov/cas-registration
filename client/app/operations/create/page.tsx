import OperationsForm from "@/app/components/form/OperationsForm";
import Loading from "@/app/components/loading";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export async function getNaicsCodes() {
  return (
    await fetch("http://localhost:8000/api/registration/naics_codes", {})
  ).json();
}

export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  localSchema.properties.naics_code_id.enum = naicsCodes?.map(
    (code) => code.id,
  );
  return localSchema;
};

export default async function Page() {
  const codes = await getNaicsCodes();
  return (
    <>
      <h1>Create a New Operation</h1>
      <Suspense fallback={<Loading />}>
        <OperationsForm
          schema={createOperationSchema(operationSchema, codes)}
        />
      </Suspense>
    </>
  );
}
