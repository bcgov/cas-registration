import AlertNote from "@bciers/components/form/components/AlertNote";
import Check from "@bciers/components/icons/Check";

export const InternalIssueResolvedNote = () => {
  return (
    <div className="w-full">
      <AlertNote icon={<Check width={20} height={20} />}>
        The issue has been resolved.
      </AlertNote>
    </div>
  );
};
