import { AutomaticOverduePenalty } from "@/compliance/src/app/types";
import AlertNote from "@bciers/components/form/components/AlertNote";

export const InternalPenaltyFAAInterestAlertNote = ({
  registry,
}: {
  registry: { formContext: AutomaticOverduePenalty };
}) => {
  const penaltyChargeRate = registry.formContext.penalty_charge_rate;

  return (
    <AlertNote>
      Automatic overdue penalty accrues daily at {penaltyChargeRate}% of the
      unpaid balance until the obligation is paid in full. If automatic overdue
      penalty is not paid by the due date, FAA interest will be incurred.
    </AlertNote>
  );
};
