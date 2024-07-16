import OperationRegistration from "apps/registration/app/components/operations/OperationRegistration";

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
    <OperationRegistration
      formSection={parseInt(formSection)}
      operation={operation}
      searchParams={searchParams}
    />
  );
}
