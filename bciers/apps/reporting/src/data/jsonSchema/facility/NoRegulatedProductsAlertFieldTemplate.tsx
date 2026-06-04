import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import Link from "next/link";

interface Props {
  report_version_id: number;
}

const LinkToActivitiesPage: React.FC<Props> = ({ report_version_id }) => (
  <Link href={`/reports/${report_version_id}/review-operation-information`}>
    Review Operation Information
  </Link>
);

const NoRegulatedProductsAlertFieldTemplate: React.FC<Props> = (props) => {
  return (
    <div>
      No regulated products selected on <LinkToActivitiesPage {...props} />.
      Expected one or more regulated products to be selected.
    </div>
  );
};

export default AlertFieldTemplateFactory(
  NoRegulatedProductsAlertFieldTemplate,
  "ALERT",
);
