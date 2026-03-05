import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import Link from "next/link";

interface Props {
  version_id: number;
  facility_id: string;
}

const LinkToProductionPage: React.FC<Props> = ({ version_id, facility_id }) => (
  <Link
    href={`/reports/${version_id}/facilities/${facility_id}/production-data`}
  >
    production data page
  </Link>
);

const MissingProductAlertContent: React.FC<Props> = (props) => {
  return (
    <div>
      To allocate emissions to a product that isn&apos;t shown below, return to
      the <LinkToProductionPage {...props} /> and select it first.
    </div>
  );
};

export default AlertFieldTemplateFactory(MissingProductAlertContent, "ALERT");
