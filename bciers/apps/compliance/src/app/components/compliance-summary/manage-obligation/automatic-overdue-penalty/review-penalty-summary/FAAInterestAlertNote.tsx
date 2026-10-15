import AlertNote from "@bciers/components/form/components/AlertNote";

export const FAAInterestAlertNote = () => {
  return (
    <AlertNote>
      Automatic overdue penalty accrues daily at 0.38% of the unpaid balance
      until the obligation is paid in full. If automatic overdue penalty is not
      paid by due date, FAA interest will be incurred.
    </AlertNote>
  );
};
