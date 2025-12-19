import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import OperatorDetailsPage from "@/administration/app/components/operators/OperatorDetailsPage";

export default async function Page(
  props: Readonly<{
    params: Promise<{ operatorId: UUID }>;
  }>,
) {
  const params = await props.params;

  const { operatorId } = params;

  return (
    <Suspense fallback={<Loading />}>
      <OperatorDetailsPage operatorId={operatorId} />
    </Suspense>
  );
}
