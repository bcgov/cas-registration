import Check from "@bciers/components/icons/Check";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { OperatorRow } from "@/administration/app/components/operators/types";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

interface TransferSuccessProps {
  fromOperatorId: string;
  toOperatorId: string;
  operators: OperatorRow[];
  effectiveDate: string;
  transferEntity: string;
}

const TransferSuccess = ({
  fromOperatorId,
  toOperatorId,
  operators,
  effectiveDate,
  transferEntity,
}: TransferSuccessProps) => {
  const router = useRouter();

  // Get the operator names from the operator IDs
  const { fromOperator, toOperator } = operators.reduce(
    (acc, operator) => {
      if (operator.id === fromOperatorId)
        acc.fromOperator = operator.legal_name;
      if (operator.id === toOperatorId) acc.toOperator = operator.legal_name;
      return acc;
    },
    { fromOperator: null, toOperator: null } as {
      fromOperator: string | null;
      toOperator: string | null;
    },
  );

  // if the effective date is in the past, the entity has been transferred
  const entityTransferred = new Date(effectiveDate) < new Date();
  return (
    <>
      <h2 className="text-bc-bg-blue">Transfer Entity</h2>
      <section className="flex flex-col items-center justify-center max-w-[600px] mx-auto mt-4">
        <div className="flex flex-col items-center justify-center text-center">
          {Check}
          {entityTransferred ? (
            <div>
              <h3>Transferred</h3>
              <p>
                {transferEntity} has been transferred from {fromOperator} to{" "}
                {toOperator}.
              </p>
              <p>
                {transferEntity} is now in the account of {toOperator}
              </p>
            </div>
          ) : (
            <p>
              {transferEntity} will be transferred from {fromOperator} to{" "}
              {toOperator} on {formatTimestamp(effectiveDate)}.
            </p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Button
            variant="outlined"
            type="button"
            onClick={() => router.push("/transfers")}
          >
            Return to Transfer Requests Table
          </Button>
        </div>
      </section>
    </>
  );
};

export default TransferSuccess;
