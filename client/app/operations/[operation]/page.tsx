import { operationSchema } from "@/jsonSchema/operations";
import OperationsForm from "@/app/components/Form/operationsForm";
import { createOperationSchema, getNaicsCodes } from "../create/page";

export async function getOperation(id: number) {
  return (
    await fetch(`http://localhost:8000/api/registration/operations/${id}`, {
      cache: "no-store",
    })
  ).json();
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
