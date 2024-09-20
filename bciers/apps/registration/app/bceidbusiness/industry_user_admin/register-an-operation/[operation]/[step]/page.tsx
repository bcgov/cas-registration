import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";

export default function Page({
  params,
  searchParams,
}: {
  params: Readonly<{ operation: UUID; step: string }>;
  searchParams: any;
}) {
  const { operation, step } = params;
  return (
    <Suspense fallback={<Loading />}>
      <OperationRegistrationPage
        step={parseInt(step)}
        operation={operation}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
