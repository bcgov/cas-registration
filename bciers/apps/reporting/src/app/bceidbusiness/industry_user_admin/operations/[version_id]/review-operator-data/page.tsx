import { UUID } from "crypto";
import OperationReviewFormData from "../../../../../components/operations/OperationReviewFormData";

export default async function Page({
  params,
}: {
  params: { version_id: UUID };
}) {
  return <OperationReviewFormData version_id={params.version_id} />;
}
