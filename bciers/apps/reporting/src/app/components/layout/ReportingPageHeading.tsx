import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";

interface Props {
  version_id: number;
}

const ReportingPageHeading = async ({ version_id }: Props) => {
  const { operation_name, version_number } =
    await getReportVersionDetails(version_id);
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-bc-bg-blue mb-0">
        {operation_name}
      </h2>
      <small className="text-bc-bg-blue">Version {version_number}</small>
    </div>
  );
};

export default ReportingPageHeading;
