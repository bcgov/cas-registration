import OperatorRequestReceived from "@/registration/app/components/operations/select-operator/request-access/received/OperatorRequestReceived";

export default async function Page({
  params,
}: {
  readonly params: { id: string; step: string };
}) {
  return <OperatorRequestReceived params={params} />;
}
