// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import OperationRegistrationPage from "@/registration/app/components/operations/OperationRegistrationPage";
import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params,
  searchParams,
}: {
  params: Readonly<{ operation: UUID; step: string }>;
  searchParams: any;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <OperationRegistrationPage
        step={1}
        operation={params?.operation}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
