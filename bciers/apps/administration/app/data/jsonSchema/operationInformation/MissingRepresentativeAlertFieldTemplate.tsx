"use client";
import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import { InfoRounded } from "@mui/icons-material";

const MissingRepresentativeAlertContent: React.FC = () => {
  return <div>Please select an operation representative</div>;
};

const component = AlertFieldTemplateFactory(
  MissingRepresentativeAlertContent,
  "ALERT",
  <InfoRounded fontSize="inherit" className="text-bc-text" />,
);

export default component;
