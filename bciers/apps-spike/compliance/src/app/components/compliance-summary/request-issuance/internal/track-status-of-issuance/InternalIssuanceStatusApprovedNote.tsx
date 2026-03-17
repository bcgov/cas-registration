import AlertNote from "@bciers/components/form/components/AlertNote";
import Check from "@bciers/components/icons/Check";

export const InternalIssuanceStatusApprovedNote = () => {
  return (
    <AlertNote icon={<Check width={20} height={20} />}>
      The issuance request is approved. The earned credits have been issued to
      the holding account as identified below in B.C. Carbon Registry (BCCR)
      successfully.
    </AlertNote>
  );
};
