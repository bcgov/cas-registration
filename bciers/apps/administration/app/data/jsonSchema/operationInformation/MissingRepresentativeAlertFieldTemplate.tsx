"use client";
import AlertFieldTemplateFactory from "@bciers/components/form/fields/AlertFieldTemplateFactory";
import { BC_GOV_TEXT } from "@bciers/styles";
import { InfoRounded } from "@mui/icons-material";

const MissingRepresentativeAlertContent: React.FC = () => {
  return <div>Please select an operation representative</div>;
};

const component = AlertFieldTemplateFactory(
  MissingRepresentativeAlertContent,
  "ALERT",
  <InfoRounded fontSize="inherit" sx={{ color: BC_GOV_TEXT }} />,
);

export default component;
