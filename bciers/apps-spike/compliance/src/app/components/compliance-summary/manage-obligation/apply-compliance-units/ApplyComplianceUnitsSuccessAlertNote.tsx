import AlertNote from "@bciers/components/form/components/AlertNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { WidgetProps } from "@rjsf/utils";

export const ApplyComplianceUnitsSuccessAlertNote = ({
  formContext,
}: WidgetProps) => {
  const { isApplied, reportingYear } = formContext;
  if (!isApplied) return null;
  return (
    <AlertNote icon={<CheckCircleIcon />}>
      The compliance unit(s) have been applied towards the compliance obligation
      successfully. You may go back to view the updated {reportingYear ?? ""}{" "}
      Compliance Summary.
    </AlertNote>
  );
};
