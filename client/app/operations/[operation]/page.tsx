import { operationSchema } from "@/jsonSchema/operations";
import OperationsForm from "@/app/components/Form/operationsForm";
import { createOperationSchema, getNaicsCodes } from "../create/page";

export const revalidate = 10;

export async function getOperation(id: number) {
  return (
    (
      await fetch(`http://localhost:8000/api/registration/operations/${id}`, {
        cache: "no-store",
      })
    )
      // check both server and client cache, see where/if they mismatch
      // can we use rtk here instead of fetch (might be better at managing the cache, cache management is NO FUN) (not the hook version, the server version)
      // other alternatives? axios?
      // make the response yourself from the terminal
      .json()
  );
}

export default async function Page({
  params,
}: {
  params: { operation: number };
}) {
  const codes = await getNaicsCodes();
  const operation = await getOperation(params.operation);

  return (
    <OperationsForm
      schema={createOperationSchema(operationSchema, codes)}
      formData={{
        ...operation,
        naics_code: Number(operation.naics_code),
        latitude: Number(operation.latitude),
        longitude: Number(operation.longitude),
        operator_percent_of_ownership: Number(
          operation.operator_percent_of_ownership
        ),
        estimated_emissions: Number(operation.estimated_emissions),
      }}
    />
  );
}
