import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";


const MissingRepresentativeAlertContent: React.FC = () => (
  <div>Please select an operation representative</div>
);

export default AlertFieldTemplateFactory(MissingRepresentativeAlertContent, "ALERT");
