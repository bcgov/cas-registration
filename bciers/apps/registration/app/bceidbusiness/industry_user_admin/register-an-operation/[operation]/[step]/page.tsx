import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";

export default async function Page(props: {
  params: Promise<Readonly<{ operation: UUID; step: string }>>;
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
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
