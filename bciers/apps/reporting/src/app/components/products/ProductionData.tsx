import { actionHandler } from "@bciers/actions";

interface Props {
  report_version_id: number;
  facility_id: string; // UUID
}

const ProductionData: React.FC<Props> = async ({
  report_version_id,
  facility_id,
}) => {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/production-data`;
  const data = [{ somedata: "test" }, {}, {}];

  const response = await actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });

  return <>response: {response}</>;
};

export default ProductionData;
