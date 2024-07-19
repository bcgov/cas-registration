import { actionHandler } from "@bciers/actions";
import OperationReview, {
  OperationReviewFormDataType,
} from "./OperationReview";

export async function getReportOperation(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/report-operation`,
    "GET",
    `reporting/report-version/${version_id}/report-operation`,
  );
}

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = await getReportOperation(version_id);
  const formData: OperationReviewFormDataType = {
    operatorLegalName: reportOperation.operator_legal_name,
    operatorTradeName: reportOperation.operator_trade_name,
    operationName: reportOperation.operation_name,
    operationType: reportOperation.operation_type,
    BCGHGID: reportOperation.operation_bcghgid,
    BOROID: reportOperation.bc_obps_regulated_operation_id,
    reportingActivities: reportOperation.reporting_activities,
    regulatedProducts: reportOperation.regulated_products,
    operationRepresentative: reportOperation.operation_representative_name,
  };

  return <OperationReview formData={formData} version_id={version_id} />;
}
