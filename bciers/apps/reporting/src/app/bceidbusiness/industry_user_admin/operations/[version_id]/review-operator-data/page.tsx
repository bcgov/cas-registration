import OperationReviewFormData from "../../../../../components/operations/OperationReviewFormData";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return <OperationReviewFormData version_id={params.version_id} />;
}
