export const runtime = "edge"; // 'nodejs' (default) | 'edge'
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { createOperationSchema, getNaicsCodes } from "../create/page";
import { Suspense } from "react";
import Loading from "@/app/components/loading";
import OperationsForm, {
  OperationsFormData,
} from "@/app/components/form/OperationsForm";

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
    <>
      <h1>Edit an Operation</h1>
      <Suspense fallback={<Loading />}>
        <OperationsForm
          schema={createOperationSchema(operationSchema, codes)}
          formData={operation as OperationsFormData}
        />
      </Suspense>
    </>
  );
}
