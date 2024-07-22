import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";

import { UUID } from "crypto";

export default function Page({
  params,
  searchParams,
}: {
  params: Readonly<{ operation: UUID | "create"; formSection: string }>;
  searchParams: any;
}) {
  const { operation, formSection } = params;
  return (
    <OperationRegistrationPage
      formSection={parseInt(formSection)}
      operation={operation}
      searchParams={searchParams}
    />
  );
}
