import TransferForm from "@/registration/app/components/transfers/TransferForm";
import TransferDetailForm from "@/registration/app/components/transfers/TransferDetailForm";
import fetchOperatorsPageData from "@/administration/app/components/operators/fetchOperatorsPageData";
import { OperatorRow } from "@/administration/app/components/operators/types";
import {
  TransferDetailFormData,
  TransferFormData,
} from "@/registration/app/components/transfers/types";
import { validate as isValidUUID } from "uuid";
import { UUID } from "crypto";
import getTransferEvent from "@/registration/app/components/transfers/getTransferEvent";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Suspense } from "react";
import {
  facilityEntitySchema,
  operationEntitySchema,
} from "@/registration/app/data/jsonSchema/transfer/transferDetail";

// 🧩 Main component
export default async function TransferPage({
  transferId,
}: {
  transferId?: UUID;
}) {
  let transferFormData: { [key: string]: any } | { error: string } = {};

  // 🛠️ Fetch the operators data
  const operators: {
    rows: OperatorRow[];
    row_count: number;
  } = await fetchOperatorsPageData({ paginate_result: "False" });
  if (!operators || "error" in operators || !operators.rows)
    throw new Error("Failed to fetch operators data");

  if (transferId) {
    if (!isValidUUID(transferId))
      throw new Error(`Invalid transfer id: ${transferId}`);

    transferFormData = await getTransferEvent(transferId);
    if (!transferFormData || "error" in transferFormData) {
      throw new Error("Error fetching transfer information.");
    }
  }

  return (
    <Suspense fallback={<Loading />}>
      {!!transferId ? (
        <TransferDetailForm
          formData={transferFormData as TransferDetailFormData}
          transferId={transferId}
          schema={
            transferFormData.transfer_entity === "Operation"
              ? await operationEntitySchema(
                  transferFormData.operation,
                  transferFormData.operation_name,
                  transferFormData.from_operator_id,
                )
              : await facilityEntitySchema(
                  transferFormData.existing_facilities,
                  transferFormData.from_operation_id,
                )
          }
        />
      ) : (
        <TransferForm
          formData={{} as TransferFormData}
          operators={operators.rows}
        />
      )}
    </Suspense>
  );
}
