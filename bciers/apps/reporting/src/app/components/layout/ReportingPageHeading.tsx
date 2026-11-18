import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";

interface Props {
  version_id: number;
  space_below?: boolean;
}

const ReportingPageHeading = async ({
  version_id,
  space_below = false,
}: Props) => {
  const { operation_name, version_number, reporting_year } =
    await getReportVersionDetails(version_id);
  return (
    <div className={`container mx-auto px-4 ${space_below ? "mb-6" : ""}`}>
      <h2 className="text-2xl font-bold text-bc-bg-blue mb-0">
        {operation_name}
      </h2>
      <div className="flex justify-between text-bc-bg-blue">
        <small>Version {version_number}</small>
        <small>{reporting_year} Reporting Year</small>
      </div>
    </div>
  );
};

export default ReportingPageHeading;
