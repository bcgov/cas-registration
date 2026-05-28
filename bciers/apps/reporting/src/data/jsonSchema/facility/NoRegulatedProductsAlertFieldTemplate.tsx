import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import Link from "next/link";

interface Props {
  report_version_id: number;
  facility_id: string;
}

const LinkToActivitiesPage: React.FC<Props> = ({
  report_version_id,
  facility_id,
}) => (
  <Link
    href={`/reports/${report_version_id}/facilities/${facility_id}/activities`}
  >
    Review Operation Information
  </Link>
);

const NoRegulatedProductsAlertContent: React.FC<Props> = (props) => {
  return (
    <div>
      No regulated products selected on <LinkToActivitiesPage {...props} />.
      Expected one or more regulated products to be selected.
    </div>
  );
};

export default AlertFieldTemplateFactory(
  NoRegulatedProductsAlertContent,
  "ALERT",
);
