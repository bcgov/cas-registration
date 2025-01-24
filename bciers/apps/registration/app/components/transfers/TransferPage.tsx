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
}: Readonly<{
  transferId?: UUID;
}>) {
  let transferFormData: { [key: string]: any } | { error: string } = {};
  let operators: {
    rows: OperatorRow[];
    row_count: number;
  } = { rows: [], row_count: 0 }; // Initialize operators with a default value
  if (transferId) {
    // to show the transfer detail form
    if (!isValidUUID(transferId))
      throw new Error(`Invalid transfer id: ${transferId}`);

    transferFormData = await getTransferEvent(transferId);
    if (!transferFormData || "error" in transferFormData) {
      throw new Error("Error fetching transfer information.");
    }
  } else {
    // to show the new transfer form
    const fetchedOperators = await fetchOperatorsPageData({
      paginate_result: "False",
    });
    if (
      !fetchedOperators ||
      "error" in fetchedOperators ||
      !fetchedOperators.rows
    )
      throw new Error("Failed to fetch operators data");

    operators = fetchedOperators; // Populate operators
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
