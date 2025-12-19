import OperationInformationPage from "@/administration/app/components/operations/OperationInformationPage";
import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(
  props: Readonly<{
    params: Promise<{ operationId: UUID }>;
  }>,
) {
  const params = await props.params;

  const { operationId } = params;

  return (
    <Suspense fallback={<Loading />}>
      <OperationInformationPage operationId={operationId} />
    </Suspense>
  );
}
