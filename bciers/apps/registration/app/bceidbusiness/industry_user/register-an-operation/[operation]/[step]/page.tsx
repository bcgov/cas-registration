import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";

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
    <OperationRegistrationPage
      step={parseInt(step)}
      operation={operation}
      searchParams={searchParams}
    />
  );
}
