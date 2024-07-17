import OperationInformationPage from "@/administration/app/components/operations/OperationInformationPage";
import { UUID } from "crypto";

export default async function Page({
  params: { operationId },
}: Readonly<{
  params: { operationId: UUID };
}>) {
  return <OperationInformationPage operationId={operationId} />;
}
