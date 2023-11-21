import OperationsOperationPage from "@/app/components/routes/operations/operation/Page";

export default function Page({ params }: { params: { operation: number } }) {
  return <OperationsOperationPage params={params} />;
}
