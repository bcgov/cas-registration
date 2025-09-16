import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import Link from "next/link";

interface Props {
  version_id: number;
  facility_id: string;
}

const MissingProductAlertContent: React.FC<Props> = ({
  version_id,
  facility_id,
}) => {
  const LinkToProductionPage = () => (
    <Link
      href={`/reports/${version_id}/facilities/${facility_id}/production-data`}
    >
      production data page
    </Link>
  );
  return (
    <div>
      Only products selected on the <LinkToProductionPage /> appear here. To
      allocate emissions to a product that isn&apos;t shown below, return to the{" "}
      <LinkToProductionPage /> and select it first.
    </div>
  );
};

export default AlertFieldTemplateFactory(MissingProductAlertContent, "ALERT");
