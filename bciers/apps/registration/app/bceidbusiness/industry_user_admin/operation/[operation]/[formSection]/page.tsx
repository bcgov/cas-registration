import OperationRegistration from "apps/registration/app/components/operations/OperationRegistration";

import { UUID } from "crypto";

export default function Page({
  params,
}: {
  params: Readonly<{ operation: UUID | "create"; formSection: string }>;
}) {
  const operationId = params.operation;
  return <OperationRegistration operationId={operationId} />;
}
