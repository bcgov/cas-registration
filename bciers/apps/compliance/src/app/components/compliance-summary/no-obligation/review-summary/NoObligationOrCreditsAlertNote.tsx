import AlertNote from "@bciers/components/form/components/AlertNote";
import Check from "@bciers/components/icons/Check";

export const NoObligationOrCreditsAlertNote = (reportingYear: any) => {
  return (
    <AlertNote icon={<Check width={20} height={20} />}>
      No compliance obligation or earned credits for this operation over the{" "}
      {reportingYear} compliance period.
    </AlertNote>
  );
};
