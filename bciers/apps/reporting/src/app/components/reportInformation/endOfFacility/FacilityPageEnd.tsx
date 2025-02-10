import Check from "@bciers/components/icons/Check";

const ReportSubmissionEnd = ({ facilityName }: { facilityName: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      {Check}
      <p className="mb-2 mt-4">End of facility report for:</p>
      <h3 className="m-0">{facilityName}</h3>
    </div>
  );
};

export default ReportSubmissionEnd;
